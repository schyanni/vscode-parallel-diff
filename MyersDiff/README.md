# MyersDiff

1.	Ausgangslage 

In der Software Entwicklung wird häufig mit Versionierungssystemen wie Git und Pull Requests gearbeitet, welche es erlauben, die gemachten Änderungen einzusehen. Die Darstellung dieser Differenzen erfolgt häufig über ein webbasiertes Tool; entweder direkt über die Webseite spezifischer Git-Hoster wie github.com und gitlab.com, oder zum Beispiel auch über den Chromium-basierten Code Editor VS Code. 

 

2.	Problemstellung 

Es soll eine Extension für Visual Studio Code entworfen werden, welche den Output eines Diff-Kernels darstellen kann. Für den Diff-Kernel sollen verschiedene Parallelisierungs-Strategien erarbeitet und diese innerhalb des von VS Code vorgebebenen Frameworks (JavaScript mit Chromium/Electron) umgesetzt werden. Die Auswirkungen der verschiedenen Strategien sollen miteinander verglichen werden. 


3.	Ziele 

Ziel ist das Designen und Erstellen einer einfachen Extension für VS Code, die den Output eines Diff/Kernels anzeigen kann, sowie die Entwicklung, Implementation und Vergleich verschiedener Parallelisierung-Strategien für einen Diff-Kernel. Konkret beinhaltet dies: 


Eine einfache Diff-Viewer Extension für VS Code, um das Diff zwischen zwei Files zu sehen 

Verschiedene Parallelisierungs-Strategien für einen geeigneten Diff-Kernel erarbeiten und umsetzen 

Kontext- & Use Case Diagramme erstellen für die Extension 

Analyse und Erörterung der Strategien mit Hilfe geeigneter Diagramme 

Auswertung der Strategien 

 


4.	Wissenschaftliche Methoden 

Analyse & Vergleich verschiedener Parallelisierungs-Strategien eines Diff-Kernels 

Kleine Literaturrecherche bezüglich Diff-Kernel 

Kleine Literaturrecherche, bezüglich JavaScript, Parallelisierung in JavaScript und dem Framework für Extensions für VS Code 