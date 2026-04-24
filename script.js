const graph = {
  nodes: Array.from({ length: 13 }, (_, i) => i + 1),
  edges: [
    { id: 1, from: 1, to: 2, weight: 4 },
    { id: 2, from: 2, to: 3, weight: 7 },
    { id: 3, from: 3, to: 4, weight: 2 },
    { id: 4, from: 4, to: 5, weight: 9 },
    { id: 5, from: 5, to: 6, weight: 5 },
    { id: 6, from: 6, to: 7, weight: 8 },
    { id: 7, from: 7, to: 8, weight: 3 },
    { id: 8, from: 8, to: 9, weight: 6 },
    { id: 9, from: 9, to: 10, weight: 4 },
    { id: 10, from: 10, to: 11, weight: 10 },
    { id: 11, from: 11, to: 12, weight: 11 },
    { id: 12, from: 12, to: 13, weight: 6 },
    { id: 13, from: 1, to: 13, weight: 15 },
    
  ]
};

let nextEdgeId = 14;
let lastMST = [];
let lastAnomalies = [];

function addEdge(graph, edge) {
  graph.edges.push({
    id: nextEdgeId++,
    from: Number(edge.from),
    to: Number(edge.to),
    weight: Number(edge.weight)
  });
  updateAll();
}

function removeEdge(graph, edgeId) {
  graph.edges = graph.edges.filter(edge => edge.id !== Number(edgeId));
  updateAll();
}

function updateWeight(graph, edgeId, newWeight) {
  const edge = graph.edges.find(edge => edge.id === Number(edgeId));
  if (edge) edge.weight = Number(newWeight);
  updateAll();
}

function computeMST(graph) {
  const anomalies = detectAnomaly(graph);
  const cursedIds = new Set(anomalies.map(a => a.id));

  const parent = {};
  const rank = {};

  graph.nodes.forEach(node => {
    parent[node] = node;
    rank[node] = 0;
  });

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(a, b) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false;

    if (rank[rootA] < rank[rootB]) parent[rootA] = rootB;
    else if (rank[rootA] > rank[rootB]) parent[rootB] = rootA;
    else {
      parent[rootB] = rootA;
      rank[rootA]++;
    }

    return true;
  }

  const validEdges = graph.edges
    .filter(edge => !cursedIds.has(edge.id))
    .slice()
    .sort((a, b) => a.weight - b.weight);

  const mst = [];
  let total = 0;

  for (const edge of validEdges) {
    if (union(edge.from, edge.to)) {
      mst.push(edge);
      total += edge.weight;
    }
    if (mst.length === graph.nodes.length - 1) break;
  }

  return { edges: mst, total, complete: mst.length === graph.nodes.length - 1 };
}

function detectAnomaly(graph) {
  const anomalies = [];
  const seenPairs = new Map();

  graph.edges.forEach(edge => {
    const reasons = [];
    let suspicion = 0;

    if (!graph.nodes.includes(edge.from) || !graph.nodes.includes(edge.to)) {
    reasons.push('Invalid node id. Nodes must be between 1 and 13.');
    suspicion += 10;
    }

    if (edge.from === edge.to) {
    reasons.push('Self-loop detected. A node cannot connect to itself.');
    suspicion += 9;
    }

    if (!Number.isFinite(edge.weight)) {
    reasons.push('Weight is not a valid number.');
    suspicion += 10;
    } else {
    if (edge.weight <= 0) {
        reasons.push('Weight is not strictly positive.');
        suspicion += 10;
    }
    if (edge.weight > 20) {
        reasons.push('Weight exceeds allowed range 1-20.');
        suspicion += 8;
    }
    }

    const a = Math.min(edge.from, edge.to);
    const b = Math.max(edge.from, edge.to);
    const key = `${a}-${b}`;

    if (seenPairs.has(key)) {
    reasons.push(`Duplicate connection with edge #${seenPairs.get(key)}.`);
    suspicion += 6;
    } else {
    seenPairs.set(key, edge.id);
    }

    if (reasons.length > 0) {
      anomalies.push({ ...edge, reasons, suspicion: Math.min(10, suspicion) });
    }
  });

  return anomalies;
}

function searchNode(graph, nodeId) {
  return graph.edges.filter(edge => edge.from === nodeId || edge.to === nodeId);
}

function updateAll() {
  lastAnomalies = detectAnomaly(graph);
  const mstResult = computeMST(graph);
  lastMST = mstResult.edges;

  renderGraph();
  renderMST(mstResult);
  renderAnomalies(lastAnomalies);
  renderEdges();
}

function isMSTEdge(edgeId) {
  return lastMST.some(edge => edge.id === edgeId);
}

function getAnomaly(edgeId) {
  return lastAnomalies.find(edge => edge.id === edgeId);
}

function renderGraph() {
  const svg = document.getElementById('graphSvg');
  svg.innerHTML = '';

  const width = 720;
  const height = 620;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 235;
  const positions = {};

  graph.nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / graph.nodes.length - Math.PI / 2;
    positions[node] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  });

  for (let r = 70; r <= radius; r += 55) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    circle.setAttribute('stroke-width', '1');
    svg.appendChild(circle);
  }

  graph.nodes.forEach(node => {
    const p = positions[node];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx);
    line.setAttribute('y1', cy);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  });

  graph.edges.forEach(edge => {
    const p1 = positions[edge.from];
    const p2 = positions[edge.to];
    if (!p1 || !p2) return;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);

    const anomaly = getAnomaly(edge.id);
    line.classList.add('edge');

    if (anomaly) line.classList.add('edge-cursed');
    else if (isMSTEdge(edge.id)) line.classList.add('edge-mst');
    else line.classList.add('edge-normal');

    line.addEventListener('click', () => showEdgeDetails(edge));
    svg.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', (p1.x + p2.x) / 2);
    label.setAttribute('y', (p1.y + p2.y) / 2);
    label.classList.add('edge-label');
    label.textContent = edge.weight;
    svg.appendChild(label);
  });

  graph.nodes.forEach(node => {
    const p = positions[node];

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', 20);
    circle.classList.add('node');
    svg.appendChild(circle);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', p.y + 1);
    label.classList.add('node-label');
    label.textContent = node;
    svg.appendChild(label);
  });
}

function showEdgeDetails(edge) {
  const box = document.getElementById('edgeDetails');
  const anomaly = getAnomaly(edge.id);

  if (anomaly) {
    box.innerHTML = `
      <strong>Edge #${edge.id}: ${edge.from} - ${edge.to}</strong><br>
      Weight: ${edge.weight}<br>
      Status: <span style="color:#ff3158">CURSED / SUSPICIOUS</span><br>
      Suspicion Level: ${anomaly.suspicion}/10<br>
      Reason: ${anomaly.reasons.join(' ')}
    `;
  } else {
    box.innerHTML = `
      <strong>Edge #${edge.id}: ${edge.from} - ${edge.to}</strong><br>
      Weight: ${edge.weight}<br>
      Status: ${isMSTEdge(edge.id) ? "<span style='color:#00ff6a'>IN MST</span>" : "Normal edge"}<br>
      Suspicion Level: 0/10
    `;
  }
}

function renderMST(result) {
  const list = document.getElementById('mstList');
  const total = document.getElementById('totalWeight');

  list.innerHTML = '';

  if (result.edges.length === 0) {
    list.innerHTML = '<li>No MST edges yet.</li>';
  } else {
    result.edges.forEach(edge => {
      const li = document.createElement('li');
      li.textContent = `#${edge.id}: ${edge.from} - ${edge.to} | weight ${edge.weight}`;
      list.appendChild(li);
    });
  }

  total.textContent = result.total;

  if (!result.complete) {
    const warning = document.createElement('li');
    warning.style.color = '#ff3158';
    warning.textContent = 'Warning: MST is incomplete. Graph is not fully connected with valid edges.';
    list.appendChild(warning);
  }
}

function renderAnomalies(anomalies) {
  const box = document.getElementById('anomalyReport');
  box.innerHTML = '';

  if (anomalies.length === 0) {
    const item = document.createElement('div');
    item.className = 'report-item safe';
    item.textContent = 'No cursed edges detected. All current edges are valid.';
    box.appendChild(item);
    return;
  }

  anomalies.forEach(edge => {
    const item = document.createElement('div');
    item.className = 'report-item cursed';
    item.innerHTML = `
      <strong>Edge #${edge.id}: ${edge.from} - ${edge.to}</strong><br>
      Weight: ${edge.weight}<br>
      Suspicion: ${edge.suspicion}/10<br>
      Why: ${edge.reasons.join(' ')}
    `;
    box.appendChild(item);
  });
}

function renderEdges() {
  const table = document.getElementById('edgeTable');
  table.innerHTML = '';

  graph.edges.forEach(edge => {
    const row = document.createElement('div');
    row.className = 'edge-row';
    const anomaly = getAnomaly(edge.id);

    row.innerHTML = `
      <strong>#${edge.id}</strong> ${edge.from} - ${edge.to}
      | w=${edge.weight}
      | ${anomaly ? "<span style='color:#ff3158'>cursed</span>" : isMSTEdge(edge.id) ? "<span style='color:#00ff6a'>MST</span>" : "normal"}
    `;

    table.appendChild(row);
  });
}

document.getElementById('addBtn').addEventListener('click', () => {
  const from = Number(document.getElementById('fromInput').value);
  const to = Number(document.getElementById('toInput').value);
  const weight = Number(document.getElementById('weightInput').value);
  addEdge(graph, { from, to, weight });
});

document.getElementById('removeBtn').addEventListener('click', () => {
  const edgeId = Number(document.getElementById('edgeIdInput').value);
  removeEdge(graph, edgeId);
});

document.getElementById('updateBtn').addEventListener('click', () => {
  const edgeId = Number(document.getElementById('edgeIdInput').value);
  const newWeight = Number(document.getElementById('newWeightInput').value);
  updateWeight(graph, edgeId, newWeight);
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const nodeId = Number(document.getElementById('searchInput').value);
  const result = searchNode(graph, nodeId);
  const box = document.getElementById('searchResult');

  if (!graph.nodes.includes(nodeId)) {
    box.textContent = 'Invalid node. Use a number from 1 to 13.';
    return;
  }

  if (result.length === 0) {
    box.textContent = `Node ${nodeId} has no connected edges.`;
    return;
  }

  box.innerHTML = `<strong>Node ${nodeId} connections:</strong><br>` +
    result.map(edge => `#${edge.id}: ${edge.from}-${edge.to} | weight ${edge.weight}`).join('<br>');
});

updateAll();
