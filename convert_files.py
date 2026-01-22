#!/usr/bin/env python3
import os
import re

# Files to convert
files_to_convert = [
    'frontend/src/pages/receptionist/ReceptionistPatients.jsx',
    'frontend/src/pages/receptionist/ReceptionistAppointments.jsx',
    'frontend/src/pages/receptionist/ReceptionistPayment.jsx',
    'frontend/src/pages/receptionist/PatientRegistration.jsx',
    'frontend/src/pages/receptionist/ReceptionistDoctors.jsx',
]

def remove_style_jsx_blocks(content):
    """Remove <style jsx>{`...`}</style> blocks"""
    pattern = r'<style jsx>\{\`[\s\S]*?\`\}<\/style>'
    return re.sub(pattern, '', content)

def remove_css_imports(content):
    """Remove CSS imports"""
    pattern = r"import\s+['\"].*?\.css['\"];?\n"
    return re.sub(pattern, '', content)

def remove_className_attributes(content):
    """Convert className to style (basic conversion - needs manual review for proper inline styles)"""
    # This is intentional - we'll handle this manually in VS Code
    return content

for file_path in files_to_convert:
    full_path = os.path.join('c:/Users/user/Desktop/pubudu-medical-center', file_path)
    
    if os.path.exists(full_path):
        print(f"Processing {file_path}...")
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove <style jsx> blocks
        content = remove_style_jsx_blocks(content)
        
        # Remove CSS imports
        content = remove_css_imports(content)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ Cleaned {file_path}")
    else:
        print(f"  ✗ File not found: {full_path}")

print("\nCleanup complete! Now convert classNames to inline styles manually.")
