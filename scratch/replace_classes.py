import os
import re

def replace_classes_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Define replacements
    replacements = {
        r'\bbg-white\b': 'bg-card',
        r'\bbg-slate-50\b': 'bg-muted',
        r'\bbg-slate-100\b': 'bg-muted',
        r'\bborder-slate-50\b': 'border-border',
        r'\bborder-slate-100\b': 'border-border',
        r'\bborder-slate-200\b': 'border-border',
        r'\btext-slate-400\b': 'text-muted-foreground',
        r'\btext-slate-500\b': 'text-muted-foreground',
        r'\btext-slate-600\b': 'text-card-foreground',
        r'\bshadow-slate-200/50\b': 'shadow-black/5',
        r'\bshadow-slate-200/60\b': 'shadow-black/5',
        r'\btext-black\b': 'text-foreground',
    }
    
    for old, new in replacements.items():
        content = re.sub(old, new, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    src_dir = r"c:\Users\thilo\.gemini\antigravity\scratch\recipe-app\frontend\src"
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                replace_classes_in_file(filepath)

if __name__ == "__main__":
    main()
