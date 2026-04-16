document.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvas-container');
    const zoomLayer = document.getElementById('zoom-layer');
    const zoomLevelText = document.getElementById('zoom-level-text');
    const bondInfoText = document.getElementById('bond-info-text');
    const btnReset = document.getElementById('btn-reset');
    const btnInfo = document.getElementById('btn-info');
    const modal = document.getElementById('help-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    
    // Zoom State
    let currentScale = 1.5;
    document.getElementById('zoom-layer').style.transform = `scale(1.5)`;

    // Elements 1 ~ 20 Data
    const cMetal = 'linear-gradient(135deg, #93c5fd, #3b82f6)';
    const cMetalloid = 'linear-gradient(135deg, #6ee7b7, #10b981)';
    const cNonmetal = 'linear-gradient(135deg, #fcd34d, #f59e0b)';
    const cNoble = 'linear-gradient(135deg, #c4b5fd, #8b5cf6)';

    const elementData = {
        H:  { name: '수소', symbol: 'H',  atomicNum: 1, gridPos: [1,1], color: cNonmetal, textCol: '#0f172a', valenceDots: 1, maxBonds: 1, type: 'nonmetal', radius: 33 },
        He: { name: '헬륨', symbol: 'He', atomicNum: 2, gridPos: [1,8], color: cNoble,    textCol: '#fff',    valenceDots: 2, maxBonds: 0, type: 'noble', radius: 31 },
        Li: { name: '리튬', symbol: 'Li', atomicNum: 3, gridPos: [2,1], color: cMetal,    textCol: '#0f172a', valenceDots: 1, maxBonds: 1, type: 'metal', radius: 54 },
        Be: { name: '베릴륨', symbol: 'Be', atomicNum: 4, gridPos: [2,2], color: cMetal,    textCol: '#0f172a', valenceDots: 2, maxBonds: 2, type: 'metal', radius: 48 },
        B:  { name: '붕소', symbol: 'B',  atomicNum: 5, gridPos: [2,3], color: cMetalloid,textCol: '#0f172a', valenceDots: 3, maxBonds: 3, type: 'metalloid', radius: 42 },
        C:  { name: '탄소', symbol: 'C',  atomicNum: 6, gridPos: [2,4], color: cNonmetal, textCol: '#0f172a', valenceDots: 4, maxBonds: 4, type: 'nonmetal', radius: 39 },
        N:  { name: '질소', symbol: 'N',  atomicNum: 7, gridPos: [2,5], color: cNonmetal, textCol: '#0f172a', valenceDots: 5, maxBonds: 3, type: 'nonmetal', radius: 37 },
        O:  { name: '산소', symbol: 'O',  atomicNum: 8, gridPos: [2,6], color: cNonmetal, textCol: '#0f172a', valenceDots: 6, maxBonds: 2, type: 'nonmetal', radius: 36 },
        F:  { name: '플루오린', symbol: 'F', atomicNum: 9, gridPos: [2,7], color: cNonmetal, textCol: '#0f172a', valenceDots: 7, maxBonds: 1, type: 'nonmetal', radius: 34 },
        Ne: { name: '네온', symbol: 'Ne', atomicNum: 10, gridPos: [2,8], color: cNoble,   textCol: '#fff',    valenceDots: 8, maxBonds: 0, type: 'noble', radius: 33 },
        Na: { name: '나트륨', symbol: 'Na', atomicNum: 11, gridPos: [3,1], color: cMetal, textCol: '#0f172a', valenceDots: 1, maxBonds: 1, type: 'metal', radius: 60 },
        Mg: { name: '마그네슘', symbol: 'Mg', atomicNum: 12, gridPos: [3,2], color: cMetal, textCol: '#0f172a', valenceDots: 2, maxBonds: 2, type: 'metal', radius: 54 },
        Al: { name: '알루미늄', symbol: 'Al', atomicNum: 13, gridPos: [3,3], color: cMetal, textCol: '#0f172a', valenceDots: 3, maxBonds: 3, type: 'metal', radius: 49 },
        Si: { name: '규소', symbol: 'Si', atomicNum: 14, gridPos: [3,4], color: cMetalloid,textCol: '#0f172a', valenceDots: 4, maxBonds: 4, type: 'metalloid', radius: 46 },
        P:  { name: '인',   symbol: 'P',  atomicNum: 15, gridPos: [3,5], color: cNonmetal, textCol: '#0f172a', valenceDots: 5, maxBonds: 3, type: 'nonmetal', radius: 43 },
        S:  { name: '황',   symbol: 'S',  atomicNum: 16, gridPos: [3,6], color: cNonmetal, textCol: '#0f172a', valenceDots: 6, maxBonds: 2, type: 'nonmetal', radius: 42 },
        Cl: { name: '염소', symbol: 'Cl', atomicNum: 17, gridPos: [3,7], color: cNonmetal, textCol: '#0f172a', valenceDots: 7, maxBonds: 1, type: 'nonmetal', radius: 40 },
        Ar: { name: '아르곤', symbol: 'Ar', atomicNum: 18, gridPos: [3,8], color: cNoble,  textCol: '#fff',    valenceDots: 8, maxBonds: 0, type: 'noble', radius: 39 },
        K:  { name: '칼륨', symbol: 'K',  atomicNum: 19, gridPos: [4,1], color: cMetal,    textCol: '#0f172a', valenceDots: 1, maxBonds: 1, type: 'metal', radius: 69 },
        Ca: { name: '칼슘', symbol: 'Ca', atomicNum: 20, gridPos: [4,2], color: cMetal,    textCol: '#0f172a', valenceDots: 2, maxBonds: 2, type: 'metal', radius: 60 }
    };

    let atoms = [];
    let bonds = [];

    // ====== UI Setup, Zoom & Pan ======

    btnInfo.addEventListener('click', () => modal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));

    // Apply scaling and panning
    let panOffsetX = 0;
    let panOffsetY = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;

    function applyTransform() {
        zoomLayer.style.transform = `translate(${panOffsetX}px, ${panOffsetY}px) scale(${currentScale})`;
    }

    function setScale(newVal) {
        currentScale = Math.max(0.3, Math.min(newVal, 3));
        applyTransform();
        zoomLevelText.textContent = Math.round(currentScale * 100) + '%';
    }

    document.getElementById('btn-zoom-in').addEventListener('click', () => setScale(currentScale + 0.1));
    document.getElementById('btn-zoom-out').addEventListener('click', () => setScale(currentScale - 0.1));
    
    canvasContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(currentScale + delta);
    }, { passive: false });

    // Panning Events (Drag Canvas background)
    canvasContainer.addEventListener('pointerdown', (e) => {
        if (e.target === canvasContainer || e.target === zoomLayer) {
            isPanning = true;
            panStartX = e.clientX - panOffsetX;
            panStartY = e.clientY - panOffsetY;
            canvasContainer.setPointerCapture(e.pointerId);
            canvasContainer.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    canvasContainer.addEventListener('pointermove', (e) => {
        if (!isPanning) return;
        panOffsetX = e.clientX - panStartX;
        panOffsetY = e.clientY - panStartY;
        applyTransform();
    });

    // Pause Electron Logic & Examples
    const btnToggleSpin = document.getElementById('btn-toggle-spin');
    const spinBtnText = document.getElementById('spin-btn-text');
    let electronsPaused = false;
    
    btnToggleSpin.addEventListener('click', () => {
        electronsPaused = !electronsPaused;
        if (electronsPaused) {
            document.body.classList.add('paused-electrons');
            btnToggleSpin.innerHTML = '<i class="fa-solid fa-play"></i> <span id="spin-btn-text">전자 재생</span>';
        } else {
            document.body.classList.remove('paused-electrons');
            btnToggleSpin.innerHTML = '<i class="fa-solid fa-pause"></i> <span id="spin-btn-text">전자 정지</span>';
        }
    });

    const exampleSelect = document.getElementById('example-select');
    if (exampleSelect) {
        exampleSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;
            
            document.getElementById('btn-reset').click();
            
            const rect = canvasContainer.getBoundingClientRect();
            const zlRect = zoomLayer.getBoundingClientRect();
            const cx = (rect.left + rect.width / 2 - zlRect.left) / currentScale;
            const cy = (rect.top + rect.height / 2 - zlRect.top) / currentScale;
            
            setTimeout(() => {
                let a1, a2, a3, a4, a5, a6;
                const tryUpgrade = (atomA, atomB, times) => {
                    const b = bonds.find(x => (x.a1.id===atomA.id && x.a2.id===atomB.id) || (x.a1.id===atomB.id && x.a2.id===atomA.id));
                    if (b) { 
                        for(let i=0; i<times; i++) {
                            b.lastUpgradeTime = 0; // Bypass rapid upgrade cooldown for programmatic generation
                            upgradeBond(b); 
                        }
                    }
                };

                switch (val) {
                    case 'H2O':
                        a1 = createAtom('O', cx, cy - 30);
                        a2 = createAtom('H', cx - 90, cy + 60);
                        a3 = createAtom('H', cx + 90, cy + 60);
                        createBond(a1, a2); createBond(a1, a3);
                        break;
                    case 'NH3':
                        a1 = createAtom('N', cx, cy - 20);
                        a2 = createAtom('H', cx - 90, cy + 50);
                        a3 = createAtom('H', cx + 90, cy + 50);
                        a4 = createAtom('H', cx, cy + 100);
                        createBond(a1, a2); createBond(a1, a3); createBond(a1, a4);
                        break;
                    case 'CH4':
                        a1 = createAtom('C', cx, cy);
                        a2 = createAtom('H', cx, cy - 110);
                        a3 = createAtom('H', cx, cy + 110);
                        a4 = createAtom('H', cx - 110, cy);
                        a5 = createAtom('H', cx + 110, cy);
                        createBond(a1, a2); createBond(a1, a3); createBond(a1, a4); createBond(a1, a5);
                        break;
                    case 'HCl':
                        a1 = createAtom('H', cx - 80, cy);
                        a2 = createAtom('Cl', cx + 80, cy);
                        createBond(a1, a2);
                        break;
                    case 'F2':
                        a1 = createAtom('F', cx - 80, cy);
                        a2 = createAtom('F', cx + 80, cy);
                        createBond(a1, a2);
                        break;
                    case 'H2O2':
                        a1 = createAtom('H', cx - 150, cy - 50);
                        a2 = createAtom('O', cx - 75, cy);
                        a3 = createAtom('O', cx + 75, cy);
                        a4 = createAtom('H', cx + 150, cy + 50);
                        createBond(a1, a2); createBond(a2, a3); createBond(a3, a4);
                        break;
                    case 'CO2':
                        a1 = createAtom('C', cx, cy);
                        a2 = createAtom('O', cx - 140, cy);
                        a3 = createAtom('O', cx + 140, cy);
                        createBond(a1, a2); createBond(a1, a3);
                        tryUpgrade(a1, a2, 1); tryUpgrade(a1, a3, 1);
                        break;
                    case 'O2':
                        a1 = createAtom('O', cx - 80, cy);
                        a2 = createAtom('O', cx + 80, cy);
                        createBond(a1, a2);
                        tryUpgrade(a1, a2, 1);
                        break;
                    case 'N2':
                        a1 = createAtom('N', cx - 80, cy);
                        a2 = createAtom('N', cx + 80, cy);
                        createBond(a1, a2);
                        tryUpgrade(a1, a2, 2);
                        break;
                    case 'HCN':
                        a1 = createAtom('H', cx - 140, cy);
                        a2 = createAtom('C', cx, cy);
                        a3 = createAtom('N', cx + 140, cy);
                        createBond(a1, a2); createBond(a2, a3);
                        tryUpgrade(a2, a3, 2);
                        break;
                    case 'C2H4':
                        a1 = createAtom('C', cx - 75, cy);
                        a2 = createAtom('C', cx + 75, cy);
                        a3 = createAtom('H', cx - 140, cy - 80);
                        a4 = createAtom('H', cx - 140, cy + 80);
                        a5 = createAtom('H', cx + 140, cy - 80);
                        a6 = createAtom('H', cx + 140, cy + 80);
                        createBond(a1, a2);
                        createBond(a1, a3); createBond(a1, a4);
                        createBond(a2, a5); createBond(a2, a6);
                        tryUpgrade(a1, a2, 1);
                        break;
                    case 'NaCl':
                        a1 = createAtom('Na', cx - 120, cy);
                        a2 = createAtom('Cl', cx + 120, cy);
                        createBond(a1, a2);
                        break;
                    case 'MgO':
                        a1 = createAtom('Mg', cx - 120, cy);
                        a2 = createAtom('O', cx + 120, cy);
                        createBond(a1, a2);
                        break;
                    case 'MgCl2':
                        a1 = createAtom('Cl', cx - 160, cy);
                        a2 = createAtom('Mg', cx, cy);
                        a3 = createAtom('Cl', cx + 160, cy);
                        createBond(a2, a1); createBond(a2, a3);
                        break;
                    case 'CaF2':
                        a1 = createAtom('F', cx - 160, cy);
                        a2 = createAtom('Ca', cx, cy);
                        a3 = createAtom('F', cx + 160, cy);
                        createBond(a2, a1); createBond(a2, a3);
                        break;
                }
                setScale(1.5);
            }, 50);
            
            e.target.value = '';
        });
    }

    const endPan = (e) => {
        if (isPanning) {
            isPanning = false;
            canvasContainer.releasePointerCapture(e.pointerId);
            canvasContainer.style.cursor = 'grab';
        }
    };
    canvasContainer.addEventListener('pointerup', endPan);
    canvasContainer.addEventListener('pointercancel', endPan);

    // Populate Sidebar in Periodic Table format
    const periodicTable = document.getElementById('periodic-table');
    Object.keys(elementData).forEach(key => {
        const data = elementData[key];
        const item = document.createElement('div');
        item.className = 'pt-cell';
        item.style.gridColumn = data.gridPos[1];
        item.style.gridRow = data.gridPos[0];
        item.style.background = data.color;
        item.style.color = data.textCol;
        
        item.innerHTML = `
            <div class="pt-number">${data.atomicNum}</div>
            <div class="pt-symbol">${data.symbol}</div>
        `;
        
        item.addEventListener('click', () => {
            const rect = canvasContainer.getBoundingClientRect();
            const zlRect = zoomLayer.getBoundingClientRect();
            
            const screenCenterX = rect.left + rect.width / 2;
            const screenCenterY = rect.top + rect.height / 2;
            
            const rawX = (screenCenterX - zlRect.left) / currentScale;
            const rawY = (screenCenterY - zlRect.top) / currentScale;

            let x = rawX;
            let y = rawY;
            
            // 겹침 방지 탐색 알고리즘
            let foundSpot = false;
            let radiusSearch = 120; // x1.5 scaled
            let attempts = 0;
            
            while (!foundSpot && attempts < 100) {
                foundSpot = true;
                for (let i = 0; i < atoms.length; i++) {
                    const a = atoms[i];
                    const dist = Math.sqrt(Math.pow(a.x - x, 2) + Math.pow(a.y - y, 2));
                    if (dist < 230) {  // scaled up tolerance
                        foundSpot = false;
                        break;
                    }
                }
                
                if (!foundSpot) {
                    const rndAngle = Math.random() * Math.PI * 2;
                    x = rawX + Math.cos(rndAngle) * radiusSearch;
                    y = rawY + Math.sin(rndAngle) * radiusSearch;
                    radiusSearch += 40; 
                    attempts++;
                }
            }

            createAtom(key, x, y);
        });
        
        periodicTable.appendChild(item);
    });

    // ====== Atom & Bonding Logic ======

    function createAtom(elementSymbol, x, y) {
        const data = elementData[elementSymbol];
        const atomId = 'atom_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        
        const atomEl = document.createElement('div');
        atomEl.className = 'atom-node';
        atomEl.id = atomId;
        atomEl.style.width = (data.radius * 2) + 'px';
        atomEl.style.height = (data.radius * 2) + 'px';
        atomEl.style.background = data.color;
        atomEl.style.color = data.textCol;
        atomEl.style.left = x + 'px';
        atomEl.style.top = y + 'px';

        const atomObj = {
            id: atomId,
            element: elementSymbol,
            x: x,  
            y: y,
            el: atomEl,
            data: data,
            bondedTo: [],
            isDragging: false,
            pointerId: null,
            dragOffsetX: 0,
            dragOffsetY: 0,
            cooldownUntil: 0
        };

        atoms.push(atomObj);
        zoomLayer.appendChild(atomEl);

        // Apply HTML structure and electrons dynamically based on atomic condition
        updateAtomVisuals(atomObj);

        // Pointer Events for Dragging & Double Tap
        atomEl.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            atomEl.setPointerCapture(e.pointerId);
            
            const zlRect = zoomLayer.getBoundingClientRect();
            const rawX = (e.clientX - zlRect.left) / currentScale;
            const rawY = (e.clientY - zlRect.top) / currentScale;
            
            atomObj.dragOffsetX = rawX - atomObj.x;
            atomObj.dragOffsetY = rawY - atomObj.y;
            atomObj.isDragging = true;
            atomObj.pointerId = e.pointerId;
            atomEl.style.zIndex = 100;
        });

        atomEl.addEventListener('pointermove', (e) => {
            if (atomObj.isDragging && atomObj.pointerId === e.pointerId) {
                const zlRect = zoomLayer.getBoundingClientRect();
                const rawX = (e.clientX - zlRect.left) / currentScale;
                const rawY = (e.clientY - zlRect.top) / currentScale;
                
                const targetX = rawX - atomObj.dragOffsetX;
                const targetY = rawY - atomObj.dragOffsetY;
                
                const dx = targetX - atomObj.x;
                const dy = targetY - atomObj.y;
                
                if (dx !== 0 || dy !== 0) {
                    moveAtomGroup(atomObj, dx, dy, []);
                    checkInteractions(atomObj);
                }
            }
        });

        let lastTapTime = 0;
        const endDrag = (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            // Double Click / Double Tap logic! (Break all bonds)
            if (tapLength > 0 && tapLength < 350) {
                breakAllBondsOfAtom(atomObj);
                lastTapTime = 0; // reset
            } else {
                lastTapTime = currentTime;
            }

            if (atomObj.isDragging && atomObj.pointerId === e.pointerId) {
                atomEl.releasePointerCapture(e.pointerId);
                atomObj.isDragging = false;
                atomObj.pointerId = null;
                atomEl.style.zIndex = 5;
            }
        };

        atomEl.addEventListener('pointerup', endDrag);
        atomEl.addEventListener('pointercancel', endDrag);
        
        return atomObj;
    }

    // Move connected molecule together recursively
    function moveAtomGroup(atom, dx, dy, visitedIds) {
        if (visitedIds.includes(atom.id)) return;
        visitedIds.push(atom.id);

        atom.x += dx;
        atom.y += dy;
        updateAtomPosition(atom);

        // Move bonded neighbors
        atom.bondedTo.forEach(neighborId => {
            const neighborAtom = atoms.find(a => a.id === neighborId);
            if (neighborAtom) {
                moveAtomGroup(neighborAtom, dx, dy, visitedIds);
            }
        });
    }

    function updateAtomPosition(atomObj) {
        atomObj.el.style.left = atomObj.x + 'px';
        atomObj.el.style.top = atomObj.y + 'px';
        updateBondsVisuals();
    }

    function updateAtomVisuals(atom) {
        let covalentBondsCount = 0;
        let ionicCharge = 0; 
        let hasIonicBond = false;

        bonds.forEach(b => {
            if (b.a1.id === atom.id || b.a2.id === atom.id) {
                if (b.type === 'covalent') {
                    covalentBondsCount += b.order;
                } else if (b.type === 'ionic') {
                    hasIonicBond = true;
                    if (atom.data.type === 'metal') ionicCharge += b.order;
                    else ionicCharge -= b.order;
                }
            }
        });

        const absCharge = Math.abs(ionicCharge);
        let symbolText = atom.data.symbol;

        // Clear existing visuals
        atom.el.innerHTML = '';
        
        // Add central nucleus text
        const contentEl = document.createElement('div');
        contentEl.className = 'ion-content';
        contentEl.textContent = symbolText;
        atom.el.appendChild(contentEl);

        // Draw Electron Shell
        const shellEl = document.createElement('div');
        shellEl.className = 'atom-shell';
        const shellRadius = atom.data.radius + 15;
        shellEl.style.width = (shellRadius * 2) + 'px';
        shellEl.style.height = (shellRadius * 2) + 'px';

        let displayDots = atom.data.valenceDots;
        
        if (atom.data.type === 'metal') {
            displayDots -= ionicCharge; // Losing electron step by step per bond
        } else {
            // Nonmetal gains from ionic, shares from covalent
            displayDots = atom.data.valenceDots - covalentBondsCount + absCharge; 
        }
        
        displayDots = Math.max(0, Math.min(8, displayDots)); 

        for (let i = 0; i < displayDots; i++) {
            const electron = document.createElement('div');
            electron.className = 'electron';
            // Evenly spread electrons
            const angle = (i / Math.max(1, displayDots)) * Math.PI * 2 - Math.PI / 2;
            electron.style.left = `calc(50% + ${Math.cos(angle) * shellRadius}px)`;
            electron.style.top = `calc(50% + ${Math.sin(angle) * shellRadius}px)`;
            shellEl.appendChild(electron);
        }
        
        atom.el.appendChild(shellEl);

        // Draw large [ ] brackets over the shell if ionic
        if (ionicCharge !== 0) {
            const bracketSize = shellRadius * 2 + 15; // wrap outside the shell
            const bracketEl = document.createElement('div');
            bracketEl.className = 'ionic-brackets';
            bracketEl.style.width = bracketSize + 'px';
            bracketEl.style.height = bracketSize + 'px';
            
            const sign = ionicCharge > 0 ? '+' : '-';
            const chargeStr = absCharge === 1 ? sign : `${absCharge}${sign}`;
            
            bracketEl.innerHTML = `
                <div class="b-left"></div>
                <div class="b-right">
                    <div class="b-charge">${chargeStr}</div>
                </div>
            `;
            atom.el.appendChild(bracketEl);
        }
    }

    function breakAllBondsOfAtom(atom) {
        const bondsToRemove = bonds.filter(b => b.a1.id === atom.id || b.a2.id === atom.id);
        bondsToRemove.forEach(b => breakBond(b.a1, b.a2));
    }

    function breakBond(atom1, atom2) {
        atom1.bondedTo = atom1.bondedTo.filter(id => id !== atom2.id);
        atom2.bondedTo = atom2.bondedTo.filter(id => id !== atom1.id);
        
        atom1.cooldownUntil = Date.now() + 1500;
        atom2.cooldownUntil = Date.now() + 1500;

        const bondId = atom1.id < atom2.id ? `bond_${atom1.id}_${atom2.id}` : `bond_${atom2.id}_${atom1.id}`;
        
        const bondIndex = bonds.findIndex(b => b.id === bondId);
        if (bondIndex !== -1) {
            bonds[bondIndex].el.remove();
            bonds.splice(bondIndex, 1);
            bondInfoText.innerHTML = `<span style="color:#ef4444"><i class="fa-solid fa-link-slash"></i> 결합이 분리되었습니다!</span>`;
        }

        // Re-evaluate visual representation for both atoms
        updateAtomVisuals(atom1);
        updateAtomVisuals(atom2);
    }

    function checkInteractions(activeAtom) {
        if (Date.now() < activeAtom.cooldownUntil) return;

        atoms.forEach(otherAtom => {
            if (otherAtom.id === activeAtom.id) return;
            if (Date.now() < otherAtom.cooldownUntil) return;
            
            const dx = activeAtom.x - otherAtom.x;
            const dy = activeAtom.y - otherAtom.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let existingBond = bonds.find(b => (b.a1.id === activeAtom.id && b.a2.id === otherAtom.id) || (b.a1.id === otherAtom.id && b.a2.id === activeAtom.id));
            let order = existingBond ? existingBond.order : 0;
            
            const isMetal = activeAtom.data.type === 'metal' || otherAtom.data.type === 'metal';

            const a1Remaining = activeAtom.data.maxBonds - activeAtom.bondedTo.length;
            const a2Remaining = otherAtom.data.maxBonds - otherAtom.bondedTo.length;

            if (a1Remaining > 0 && a2Remaining > 0) {
                const triggerDist = isMetal ? 200 : 140; // 이온 결합은 대괄호 크기 때문에 멀리서 인식
                if (order === 0 && dist < triggerDist) { 
                    createBond(activeAtom, otherAtom);
                }
                // Drag-upgrade removed. Now upgraded via clicking the bond natively.
            }
        });
    }

    function upgradeBond(bond) {
        if (bond.lastUpgradeTime && Date.now() - bond.lastUpgradeTime < 300) return;
        bond.lastUpgradeTime = Date.now();

        bond.order++;
        bond.a1.bondedTo.push(bond.a2.id);
        bond.a2.bondedTo.push(bond.a1.id);

        renderBondLines(bond);
        updateAtomVisuals(bond.a1);
        updateAtomVisuals(bond.a2);

        bondInfoText.innerHTML = `<strong style="color:#60a5fa">[다중 공유 결합]</strong> ${bond.a1.data.name}와(과) ${bond.a2.data.name}이(가) ${bond.order}중 공유 결합을 형성했습니다! <span style="color:#fde047">(공유 전자쌍 ${bond.order}개 표시)</span>`;

        // Bounce snap inwards
        const dx = bond.a2.x - bond.a1.x;
        const dy = bond.a2.y - bond.a1.y;
        const angle = Math.atan2(dy, dx);
        
        let optimalDist = bond.a1.data.radius + bond.a2.data.radius + 35;
        if (bond.order === 2) optimalDist -= 5;
        if (bond.order === 3) optimalDist -= 10;

        const targetX = bond.a2.x - Math.cos(angle) * optimalDist;
        const targetY = bond.a2.y - Math.sin(angle) * optimalDist;
        
        // Squeeze a1 towards a2 while completely holding a2 still.
        const moveDx = targetX - bond.a1.x;
        const moveDy = targetY - bond.a1.y;
        
        moveAtomGroup(bond.a1, moveDx, moveDy, [bond.a2.id]);
    }

    function createBond(atom1, atom2) {
        if (atom1.data.maxBonds === 0 || atom2.data.maxBonds === 0) return;
        if (atom1.bondedTo.length >= atom1.data.maxBonds || atom2.bondedTo.length >= atom2.data.maxBonds) return;

        // 금속끼리 결합 금지 (금속 결합은 이온/공유 결합 시뮬레이션에서 제외)
        if (atom1.data.type === 'metal' && atom2.data.type === 'metal') return;

        const bondId = atom1.id < atom2.id ? `bond_${atom1.id}_${atom2.id}` : `bond_${atom2.id}_${atom1.id}`;
        if (bonds.some(b => b.id === bondId)) return;

        let bondType = 'covalent';
        let bondColor = '#cbd5e1'; 
        let initialOrder = 1;
        
        if (atom1.data.type === 'metal' || atom2.data.type === 'metal') {
            bondType = 'ionic';
            
            const a1Rem = atom1.data.maxBonds - atom1.bondedTo.length;
            const a2Rem = atom2.data.maxBonds - atom2.bondedTo.length;
            initialOrder = Math.max(1, Math.min(a1Rem, a2Rem));
            
        } else if ((atom1.element === 'H' && atom2.element === 'O') || (atom1.element === 'O' && atom2.element === 'H')) {
            bondColor = '#93c5fd'; 
        } else if ((atom1.element === 'C' && atom2.element === 'O') || (atom1.element === 'O' && atom2.element === 'C')) {
            bondColor = '#fca5a5';
        }

        for (let i = 0; i < initialOrder; i++) {
            atom1.bondedTo.push(atom2.id);
            atom2.bondedTo.push(atom1.id);
        }

        const bondEl = document.createElement('div');
        bondEl.className = 'bond-line';
        
        bondEl.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            const b = bonds.find(x => x.id === bondId);
            if (!b) return;
            const a1R = b.a1.data.maxBonds - b.a1.bondedTo.length;
            const a2R = b.a2.data.maxBonds - b.a2.bondedTo.length;
            const isMt = b.a1.data.type === 'metal' || b.a2.data.type === 'metal';
            
            if (a1R > 0 && a2R > 0 && !isMt && b.order < 3) {
                upgradeBond(b);
            }
        });

        zoomLayer.appendChild(bondEl);
        
        const bondObj = { id: bondId, a1: atom1, a2: atom2, el: bondEl, type: bondType, order: initialOrder, color: bondColor, lastUpgradeTime: Date.now() };
        bonds.push(bondObj);
        
        renderBondLines(bondObj);
        updateBondsVisuals();
        
        // Update both atoms (will process ionic charges and deduct shared electrons)
        updateAtomVisuals(atom1);
        updateAtomVisuals(atom2);
        
        const msgHtml = bondType === 'ionic' 
            ? `<strong style="color:#c084fc">[이온 결합]</strong> ${atom1.data.name}와(과) ${atom2.data.name}이(가) 만나 전자가 이동하여 [대괄호] 형태의 이온이 생성되었습니다.`
            : `<strong style="color:#60a5fa">[공유 결합]</strong> ${atom1.data.name}와(과) ${atom2.data.name}이(가) 전자를 1개씩 공유했습니다. 잉여 전자도 계속 확인하세요!`;
        
        bondInfoText.innerHTML = msgHtml;
        
        // Snap the moving atom to optimal aesthetic distance
        const dx = atom2.x - atom1.x;
        const dy = atom2.y - atom1.y;
        let angle = Math.atan2(dy, dx);
        let optimalDist = atom1.data.radius + atom2.data.radius;
        
        if (bondType === 'ionic') {
            optimalDist += 130; // Further scaled up for fat brackets
            angle = dx > 0 ? 0 : Math.PI;
        } else {
            optimalDist += 35; // 단일 결합 길이를 이중/삼중 결합 기준(+35)과 맞춤
        }
        
        if (atom1.isDragging) {
            const targetX = atom2.x - Math.cos(angle) * optimalDist;
            const targetY = atom2.y - Math.sin(angle) * optimalDist;
            moveAtomGroup(atom1, targetX - atom1.x, targetY - atom1.y, []);
        }
    }

    function renderBondLines(bond) {
        bond.el.innerHTML = ''; 

        if (bond.type === 'ionic') {
            const line = document.createElement('div');
            line.style.width = '100%';
            line.style.borderBottom = '3px dashed rgba(255,255,255,0.2)';
            bond.el.appendChild(line);
        } else {
            for (let i = 0; i < bond.order; i++) {
                const line = document.createElement('div');
                line.className = 'single-bond-line';
                line.style.background = bond.color;
                line.style.boxShadow = `0 0 8px ${bond.color}`;

                const e1 = document.createElement('div'); e1.className = 'shared-electron left-e';
                const e2 = document.createElement('div'); e2.className = 'shared-electron right-e';
                line.appendChild(e1);
                line.appendChild(e2);
                
                bond.el.appendChild(line);
            }
        }
    }

    function updateBondsVisuals() {
        bonds.forEach(bond => {
            const dx = bond.a2.x - bond.a1.x;
            const dy = bond.a2.y - bond.a1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            bond.el.style.width = dist + 'px';
            bond.el.style.left = bond.a1.x + 'px';
            bond.el.style.top = bond.a1.y + 'px';
            bond.el.style.transform = `translateY(-50%) rotate(${angle}deg)`;
        });
    }

    btnReset.addEventListener('click', () => {
        atoms.forEach(a => a.el.remove());
        bonds.forEach(b => b.el.remove());
        atoms = [];
        bonds = [];
        bondInfoText.innerHTML = '주기율표 패널에서 1~20번 원소를 추가하고 결합해 보세요.';
        panOffsetX = 0;
        panOffsetY = 0;
        setScale(1.5);
    });
});
