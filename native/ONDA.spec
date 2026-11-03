from pathlib import Path
root = Path(SPECPATH)
a = Analysis([str(root/'onda.py')], pathex=[str(root)], binaries=[], datas=[], hiddenimports=['matplotlib.backends.backend_macosx'], hookspath=[], hooksconfig={'matplotlib': {'backends': ['MacOSX']}}, excludes=['scipy','librosa','pytest','IPython','tkinter'], noarchive=False)
pyz = PYZ(a.pure)
exe = EXE(pyz,a.scripts,[],exclude_binaries=True,name='ONDA',debug=False,strip=False,upx=False,console=False,target_arch='arm64',codesign_identity='BlackMamba ControlGame Local Signing',entitlements_file=str(root/'entitlements.plist'))
coll = COLLECT(exe,a.binaries,a.datas,strip=False,upx=False,name='ONDA')
app = BUNDLE(coll,name='ONDA.app',icon=str(root/'assets/ONDA.icns'),bundle_identifier='corp.blackmamba.onda',info_plist={'CFBundleShortVersionString':'1.0.0','CFBundleVersion':'1','NSMicrophoneUsageDescription':'ONDA utiliza el micrófono para visualizar ondas de audio en tiempo real. No graba audio.','NSHighResolutionCapable':True,'LSApplicationCategoryType':'public.app-category.music'})
