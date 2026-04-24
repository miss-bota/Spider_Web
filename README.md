A Hunter x Hunter themed Single Page Application for maintaining a dynamic weighted graph, detecting cursed edges, and computing a Minimum Spanning Tree using Kruskal's Algorithm.

## Features

- Add edges between 13 Phantom Troupe nodes
- Remove edges by edge ID
- Update edge weights
- Search node connections
- Visualize the graph using SVG
- Highlight MST edges in green
- Highlight cursed/anomalous edges in red
- Display total MST weight
- Show anomaly report with logic explanation

## Algorithms

The app uses Kruskal's Algorithm to compute the MST.

Before computing the MST, the app detects suspicious edges:
- invalid node IDs
- self-loops
- weights less than or equal to 0
- weights greater than 20
- duplicate undirected edges

Suspicious edges are excluded from the MST.

## Files

- `index.html` - page structure
- `style.css` - Hunter x Hunter themed styling
- `script.js` - graph logic, MST, anomaly detection, and UI rendering
- `strategy.txt` - explanation of the algorithm and detection strategy

## Run Locally

Open `index.html` in a browser.
