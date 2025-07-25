# **App Name**: CAD Comparator

## Core Features:

- File Upload: Allow users to upload two STEP files for comparison.
- 3D Model Display: Display the 3D models from the uploaded STEP files side-by-side using a 3D rendering library.
- Difference Highlighting: Visually highlight the differences between the two 3D models. Add a feature to toggle on and off.
- Property Comparison: Display the properties (volume, surface area, etc.) of each 3D model and highlight differences in a table.
- Comparison Report: Use a tool to analyze the differences and generate a report summarizing the key changes. This tool may also offer explanations for why some features changed.  The comparison will be done where there is a base model, next the uploaded files by many people also should be check for plagiarism.
- Google Authentication: Authentication provided by Google Sign-In.
- Admin File Backup: The back up of the files with time stamp along with the report will be saved. Since I am the administrator only i should be able to see

## Style Guidelines:

- Use a vibrant blue (#3498db) to evoke a sense of technology and precision, and because the app is for CAD (CAD = Computer-Aided Design)
- A light gray (#ecf0f1) will provide a clean, neutral backdrop.
- A vivid orange (#e67e22) will highlight interactive elements and differences within the CAD models.
- Body and headline font: 'Inter' (sans-serif) for a clean and modern look.
- Use a set of minimalistic icons related to CAD and file comparison to ensure visual clarity and ease of understanding.
- Implement a clear, divided layout. On the left and right, the CAD models, and a panel on the bottom with file properties, the report from the tool, and any toggles.
- Introduce smooth transitions for file loading and when highlighting differences between models.