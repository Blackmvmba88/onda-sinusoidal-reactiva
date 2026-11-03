from pathlib import Path
import subprocess
import PyInstaller.utils.osx

# Local signing has no Apple distribution timestamp requirement.
# Keep the configured certificate for every bundled binary.
# A local certificate has no Apple Team ID, so do not enable hardened runtime.
def sign_local(filename, identity=None, entitlements_file=None, deep=False):
    command = ['/usr/bin/codesign', '--force', '--all-architectures',
               '--timestamp=none', '--sign', identity or '-']
    if entitlements_file:
        command += ['--entitlements', entitlements_file]
    if deep:
        command += ['--deep']
    subprocess.run(command + [str(filename)], check=True, capture_output=True)
PyInstaller.utils.osx.sign_binary = sign_local
root = Path(SPECPATH)
a = Analysis([str(root/'onda.py')], pathex=[str(root)], binaries=[], datas=[], hiddenimports=['matplotlib.backends.backend_macosx'], hookspath=[], hooksconfig={'matplotlib': {'backends': ['MacOSX']}}, excludes=['scipy','librosa','pytest','IPython','tkinter'], noarchive=False)
pyz = PYZ(a.pure)
exe = EXE(pyz,a.scripts,[],exclude_binaries=True,name='ONDA',debug=False,strip=False,upx=False,console=False,target_arch='arm64',codesign_identity='BlackMamba ControlGame Local Signing',entitlements_file=str(root/'entitlements.plist'))
coll = COLLECT(exe,a.binaries,a.datas,strip=False,upx=False,name='ONDA')
app = BUNDLE(coll,name='ONDA.app',icon=str(root/'assets/ONDA.icns'),bundle_identifier='corp.blackmamba.onda',info_plist={'CFBundleShortVersionString':'1.1.1','CFBundleVersion':'3','NSMicrophoneUsageDescription':'ONDA utiliza el micrófono para visualizar ondas de audio en tiempo real. No graba audio.','NSHighResolutionCapable':True,'LSApplicationCategoryType':'public.app-category.music'})
