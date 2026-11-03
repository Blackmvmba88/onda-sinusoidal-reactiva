"""ONDA · BlackMamba — native audio instrument."""
import argparse
import collections
import threading
import json
import re
from pathlib import Path
import numpy as np
import sounddevice as sd
import matplotlib
if '--snapshot' in __import__('sys').argv:
    matplotlib.use('Agg')
else:
    matplotlib.use('macosx')
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.widgets import Button, Slider, RadioButtons, TextBox
from matplotlib.colors import hsv_to_rgb

BG, PANEL, INK, MUTED, LIME = '#090d13', '#141c27', '#edf3fa', '#97a8bc', '#bdff45'

THEMES = {
    'Oscuro': ('#090d13','#141c27','#edf3fa','#97a8bc'),
    'Plata': ('#e3e8ef','#f8fafc','#142032','#4e6075'),
    'Morado': ('#160e27','#291c40','#f4edff','#bdacd5'),
    'Océano': ('#071b26','#10303e','#e4faff','#8eb9c7'),
}
DEFAULTS = dict(theme='Oscuro', texture='Lisa', accent='#bdff45',
                footer_left='O  CÍRCULO     ESPACIO  LÍNEA     P  PAUSA',
                footer_right='AUDIO LOCAL · SIN GRABACIÓN')
PREFS = Path.home()/'Library/Application Support/BlackMamba/ONDA/preferences.json'

def load_preferences(path):
    result = DEFAULTS.copy()
    try:
        saved = json.loads(path.read_text())
        if not isinstance(saved, dict): return result
        for key in result:
            value = saved.get(key)
            if not isinstance(value, str): continue
            if key == 'theme' and value not in THEMES: continue
            if key == 'texture' and value not in ('Lisa','Grano','Cuadrícula','Ondas'): continue
            if key == 'accent' and not re.fullmatch(r'#[0-9a-fA-F]{6}',value): continue
            result[key] = value[:100] if key.startswith('footer') else value
    except (OSError, ValueError): pass
    return result

class Onda:
    def __init__(self, demo=False, preferences_path=None):
        self.preferences_path = Path(preferences_path) if preferences_path else PREFS
        self.preferences = load_preferences(self.preferences_path)
        self.settings_fig = None
        self.editors = []
        self.lock = threading.Lock()
        self.buffer = np.zeros(2048)
        self.history = collections.deque(maxlen=9)
        self.stream = None
        self.demo, self.paused, self.mode = demo, False, 'Línea'
        self.device_ids = []
        self.buttons = []
        plt.rcParams.update({'font.family':'sans-serif', 'text.color':INK, 'axes.labelcolor':INK})
        self.fig = plt.figure(figsize=(12,8), facecolor=BG)
        self.fig.canvas.manager.set_window_title('ONDA · BlackMamba')
        self.fig.text(.055,.92,'ONDA',fontsize=30,weight='bold')
        self.fig.text(.215,.925,'BLACKMAMBA  /  AUDIO LAB',fontsize=10,color=MUTED)
        self.status = self.fig.text(.055,.86,'DEMO · señal sintética' if demo else 'ENTRADA DETENIDA · inicia el micrófono',fontsize=10,color=LIME)
        self.metric = self.fig.text(.73,.91,'— dBFS',fontsize=23,weight='bold')
        self.fig.text(.73,.87,'NIVEL RMS  /  44.1 kHz',fontsize=9,color=MUTED)
        self.ax = self.fig.add_axes([.055,.34,.68,.46],facecolor=PANEL)
        self.ax.set_xticks([]); self.ax.set_yticks([])
        for spine in self.ax.spines.values(): spine.set_color('#273344')
        self.lines = [self.ax.plot([],[],lw=2,alpha=(1-i/10)**2)[0] for i in range(9)]
        self.set_mode('Línea')
        self.button([.77,.72,.18,.055],'Iniciar micrófono',self.start)
        self.button([.77,.65,.18,.055],'Modo demo',self.toggle_demo)
        self.pause_btn = self.button([.77,.58,.18,.055],'Pausar',self.pause)
        ra = self.fig.add_axes([.77,.37,.18,.16],facecolor=PANEL)
        self.radio = RadioButtons(ra,['Línea','Círculo'],activecolor=LIME)
        for label in self.radio.labels: label.set_color(INK)
        self.radio.on_clicked(self.set_mode)
        self.gain = self.slider(.24,'Ganancia',.1,8,1)
        self.width = self.slider(.18,'Grosor',.5,5,2)
        self.speed = self.slider(.12,'Color',0,.03,.005)
        self.footer_left = self.fig.text(.055,.045,'',fontsize=9,color=MUTED)
        self.footer_right = self.fig.text(.95,.045,'',fontsize=8,color=MUTED,ha='right')
        self.button([.77,.26,.18,.055],'Personalizar',self.customize)
        self.background = self.fig.add_axes([0,0,1,1],zorder=-10)
        self.background.set_axis_off()
        self.apply_style()
        self.fig.canvas.mpl_connect('key_press_event',self.key)
        self.fig.canvas.mpl_connect('close_event',lambda event:self.close())

    def apply_style(self):
        bg,panel,ink,muted = THEMES[self.preferences['theme']]
        accent=self.preferences['accent']
        self.fig.set_facecolor(bg)
        self.background.clear(); self.background.set_axis_off()
        y,x=np.mgrid[0:400,0:600]
        kind=self.preferences['texture']
        if kind=='Grano': pattern=np.random.default_rng(42).random((400,600))
        elif kind=='Cuadrícula': pattern=((x%24==0)|(y%24==0)).astype(float)
        elif kind=='Ondas': pattern=(np.sin(x/35+y/20)+1)/2
        else: pattern=np.zeros((400,600))
        self.background.imshow(pattern,cmap='gray',alpha=0 if kind=='Lisa' else .08,
                               aspect='auto',interpolation='nearest')
        for text in self.fig.texts: text.set_color(muted)
        self.fig.texts[0].set_color(ink)
        self.status.set_color(accent); self.metric.set_color(ink)
        self.footer_left.set_text(self.preferences['footer_left'])
        self.footer_right.set_text(self.preferences['footer_right'])
        # Fit custom footers into two independent columns.
        for text,available in ((self.footer_left,.53),(self.footer_right,.32)):
            text.set_fontsize(9)
            renderer=self.fig.canvas.get_renderer() if hasattr(self.fig.canvas,'get_renderer') else None
            if renderer:
                width=text.get_window_extent(renderer).width
                if width: text.set_fontsize(max(3,min(9,9*self.fig.bbox.width*available/width)))
        for ax in self.fig.axes:
            if ax is self.background: continue
            ax.set_facecolor(panel)
            for spine in ax.spines.values(): spine.set_color(muted)
        for btn in self.buttons:
            btn.color=panel; btn.hovercolor=bg; btn.label.set_color(ink)
        for slider in (self.gain,self.width,self.speed):
            slider.label.set_color(muted); slider.valtext.set_color(ink)
            slider.poly.set_facecolor(accent)
        for label in self.radio.labels: label.set_color(ink)
        self.radio.set_radio_props({'facecolor':[accent]*2})
        self.fig.canvas.draw_idle()

    def change_preference(self,key,value):
        if key=='accent' and not re.fullmatch(r'#[0-9a-fA-F]{6}',value):
            self.settings_status.set_text('Usa un color hexadecimal: #RRGGBB')
            return
        self.preferences[key]=value[:100] if key.startswith('footer') else value
        self.apply_style()
        if hasattr(self,'settings_status'):
            self.settings_status.set_text('Vista previa · pulsa Guardar para conservar')
            self.settings_fig.canvas.draw_idle()

    def save_preferences(self,event=None):
        try:
            self.preferences_path.parent.mkdir(parents=True,exist_ok=True)
            temporary=self.preferences_path.with_suffix('.tmp')
            temporary.write_text(json.dumps(self.preferences,ensure_ascii=False,indent=2))
            temporary.replace(self.preferences_path)
            self.settings_status.set_text('Preferencias guardadas')
        except OSError:
            self.settings_status.set_text('No se pudo guardar; revisa el acceso a tu carpeta de usuario')
        self.settings_fig.canvas.draw_idle()

    def customize(self,event=None):
        if self.settings_fig is not None and plt.fignum_exists(self.settings_fig.number):
            self.settings_fig.show(); return
        self.settings_fig=plt.figure(figsize=(8,6),facecolor=BG)
        self.settings_fig.canvas.manager.set_window_title('ONDA · Personalizar')
        self.settings_fig.text(.07,.91,'Tu ventana, tu estilo',fontsize=20,color=INK,weight='bold')
        self.settings_fig.text(.07,.85,'Edita los textos y pulsa Enter para previsualizar. Máximo 100 caracteres.',color=MUTED,fontsize=9)
        self.editors=[]
        for key,label,y in [('footer_left','Pie izquierdo',.72),('footer_right','Pie derecho',.61),('accent','Acento HEX',.50)]:
            ax=self.settings_fig.add_axes([.23,y,.69,.055])
            box=TextBox(ax,label+'  ',initial=self.preferences[key],color='#e3e8ef',hovercolor='white')
            box.label.set_color(INK)
            box.on_submit(lambda value,k=key:self.change_preference(k,value))
            self.editors.append(box)
        for key,options,rect in [('theme',list(THEMES),[.12,.17,.32,.25]),
                                  ('texture',['Lisa','Grano','Cuadrícula','Ondas'],[.56,.17,.32,.25])]:
            ax=self.settings_fig.add_axes(rect,facecolor=PANEL)
            widget=RadioButtons(ax,options,active=options.index(self.preferences[key]),activecolor=LIME)
            for label in widget.labels: label.set_color(INK)
            widget.on_clicked(lambda value,k=key:self.change_preference(k,value))
            self.editors.append(widget)
        self.settings_fig.text(.12,.435,'TEMA',fontsize=9,color=MUTED)
        self.settings_fig.text(.56,.435,'TEXTURA',fontsize=9,color=MUTED)
        self.settings_status=self.settings_fig.text(.07,.105,'Vista previa · los cambios no se guardan hasta pulsar Guardar',fontsize=9,color=MUTED)
        ax=self.settings_fig.add_axes([.68,.025,.24,.055])
        save=Button(ax,'Guardar',color=LIME,hovercolor='#d5ff92')
        save.on_clicked(self.save_preferences); self.editors.append(save)
        self.settings_fig.show()

    def button(self,rect,label,fn):
        ax=self.fig.add_axes(rect)
        btn=Button(ax,label,color=PANEL,hovercolor='#29394b')
        btn.label.set_color(INK); btn.label.set_fontsize(10)
        btn.on_clicked(fn); self.buttons.append(btn)
        return btn

    def slider(self,y,label,lo,hi,value):
        ax=self.fig.add_axes([.18,y,.52,.023],facecolor=PANEL)
        slider=Slider(ax,label,lo,hi,valinit=value,color=LIME)
        slider.label.set_color(MUTED); slider.valtext.set_color(INK)
        return slider

    def close(self):
        if self.stream is not None:
            self.stream.stop(); self.stream.close(); self.stream=None

    def start(self,event=None):
        self.close()
        try:
            self.stream=sd.InputStream(channels=1,samplerate=44100,blocksize=2048,callback=self.audio)
            self.stream.start(); self.demo=False; self.history.clear()
            self.status.set_text('MICRÓFONO ACTIVO · entrada predeterminada del sistema')
        except Exception as exc:
            self.close(); self.demo=False
            self.status.set_text('SIN ENTRADA · revisa el permiso de micrófono o usa demo')
            print(f'Audio: {exc}',flush=True)

    def audio(self,data,frames,time,status):
        with self.lock:
            self.buffer=data[:,0].copy()
        if status: print(status,flush=True)

    def toggle_demo(self,event=None):
        self.close(); self.demo=True; self.history.clear()
        self.status.set_text('DEMO · señal sintética / no es audio del micrófono')

    def pause(self,event=None):
        self.paused=not self.paused
        self.pause_btn.label.set_text('Continuar' if self.paused else 'Pausar')

    def key(self,event):
        if event.key in ('o','O'): self.radio.set_active(1)
        elif event.key in (' ','space'): self.radio.set_active(0)
        elif event.key in ('p','P'): self.pause()

    def set_mode(self,mode):
        self.mode=mode; self.history.clear()
        self.ax.set_xlim((-1.5,1.5) if mode=='Círculo' else (0,46.44))
        self.ax.set_ylim(-1.5,1.5)
        self.ax.set_aspect('equal' if mode=='Círculo' else 'auto')
        for line in self.lines: line.set_data([],[])

    def update(self,frame):
        if self.paused: return self.lines
        with self.lock: data=self.buffer.copy()
        if self.demo:
            t=np.arange(2048)/44100
            data=.45*np.sin(2*np.pi*(220+80*np.sin(frame/70))*t+frame*.1)
        rms=float(np.sqrt(np.mean(data**2)))
        self.metric.set_text(f'{20*np.log10(max(rms,1e-6)):.1f} dBFS')
        self.metric.set_color('#ff6c78' if np.max(np.abs(data))>=.99 else THEMES[self.preferences['theme']][2])
        self.history.appendleft(data*self.gain.val)
        for i,line in enumerate(self.lines):
            if i>=len(self.history): continue
            wave=self.history[i]
            from matplotlib.colors import to_rgb, rgb_to_hsv
            hue=rgb_to_hsv(to_rgb(self.preferences['accent']))[0]
            line.set_color(hsv_to_rgb(((hue+frame*self.speed.val+i*.035)%1,.72,1)))
            line.set_linewidth(max(.5,self.width.val-i*.15))
            if self.mode=='Círculo':
                theta=np.linspace(0,2*np.pi,len(wave)); radius=.85-i*.025+wave*.35
                line.set_data(radius*np.cos(theta),radius*np.sin(theta))
            else: line.set_data(np.arange(len(wave))/44.1,wave-i*.025)
        return self.lines

    def run(self):
        self.animation=FuncAnimation(self.fig,self.update,interval=30,blit=False,cache_frame_data=False)
        plt.show()
        self.close()

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--demo',action='store_true')
    parser.add_argument('--snapshot')
    args=parser.parse_args()
    app=Onda(demo=args.demo)
    if args.snapshot:
        for frame in range(15): app.update(frame)
        app.fig.savefig(args.snapshot,dpi=150,facecolor=BG)
    else: app.run()
