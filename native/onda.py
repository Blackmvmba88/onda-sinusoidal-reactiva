"""ONDA · BlackMamba — native audio instrument."""
import argparse
import collections
import threading
import numpy as np
import sounddevice as sd
import matplotlib
if '--snapshot' in __import__('sys').argv:
    matplotlib.use('Agg')
else:
    matplotlib.use('macosx')
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from matplotlib.widgets import Button, Slider, RadioButtons
from matplotlib.colors import hsv_to_rgb

BG, PANEL, INK, MUTED, LIME = '#090d13', '#141c27', '#edf3fa', '#97a8bc', '#bdff45'

class Onda:
    def __init__(self, demo=False):
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
        self.fig.text(.055,.045,'O  CÍRCULO     ESPACIO  LÍNEA     P  PAUSA',fontsize=9,color=MUTED)
        self.fig.text(.72,.045,'AUDIO LOCAL · SIN GRABACIÓN',fontsize=8,color=MUTED)
        self.fig.canvas.mpl_connect('key_press_event',self.key)
        self.fig.canvas.mpl_connect('close_event',lambda event:self.close())

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
        self.metric.set_color('#ff6c78' if np.max(np.abs(data))>=.99 else INK)
        self.history.appendleft(data*self.gain.val)
        for i,line in enumerate(self.lines):
            if i>=len(self.history): continue
            wave=self.history[i]
            line.set_color(hsv_to_rgb(((.22+frame*self.speed.val+i*.035)%1,.72,1)))
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
