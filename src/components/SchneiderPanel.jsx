import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

// --- Firebase Integration ---
import { initializeApp, getApps } from "firebase/app"; 
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfigRTDB = {
  apiKey: "AIzaSyCwOjCx_FHmZdlIiW_3rLYx93-rvTFgzC4",
  databaseURL: "https://monitoring123-b4e41-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

function getFirebaseApp() {
    const apps = getApps();
    const existingApp = apps.find(app => app.name === "rtdbApp");
    if (existingApp) return existingApp;
    return initializeApp(firebaseConfigRTDB, "rtdbApp");
}

const rtdbApp = getFirebaseApp();
const dbRTDB = getDatabase(rtdbApp);
const authRTDB = getAuth(rtdbApp);

export default function SchneiderPanel() {
  const hostRef = useRef(null);
  const rafRef = useRef(null);
  const [firebaseData, setFirebaseData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State khusus untuk anomali
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyIndex, setAnomalyIndex] = useState(0);

  // ✅ [MODIFIKASI 1] Teks diubah ke Bahasa Inggris
  const pmDisplayConfig = [
    { key: "Vavg_calc", title: "Average Voltage", unit: "V", min: 11000, max: 22000, decimals: 2 },
    { key: "Iavg", title: "Average Current", unit: "A", min: 0, max: 10, decimals: 4 },
    { key: "Ptot", title: "Total Power", unit: "kW", min: 0, max: 1000, decimals: 4 },
    { key: "Edel", title: "Energy Delivered", unit: "kWh", min: -Infinity, max: Infinity, decimals: 2 },
    { key: "V1", title: "Phase 1 Voltage", unit: "V", min: 19000, max: 22000, decimals: 2 },
    { key: "V2", title: "Phase 2 Voltage", unit: "V", min: 19000, max: 22000, decimals: 2 },
    { key: "V3", title: "Phase 3 Voltage", unit: "V", min: 19000, max: 22000, decimals: 2 },
  ];

  // useEffect untuk Firebase (tidak ada perubahan)
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(authRTDB, (user) => {
        if (user) {
            const sensorRef = ref(dbRTDB, "sensor_data");
            const dataUnsubscribe = onValue(sensorRef, 
                (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setFirebaseData(data);
                        setError(null);
                    } else {
                        setError("Data not found at path 'sensor_data'.");
                    }
                    setIsLoading(false);
                }, 
                (err) => {
                    setError("Access Denied. Check your database security rules.");
                    setIsLoading(false);
                }
            );
            return () => dataUnsubscribe();
        } else {
            signInAnonymously(authRTDB).catch((err) => {
                setError("Failed to login to Firebase. Check connection or config.");
                setIsLoading(false);
            });
        }
    });
    return () => authUnsubscribe();
  }, []);

  // useEffect untuk Three.js (tidak ada perubahan)
  useEffect(() => {
    // ... (kode three.js Anda yang panjang tetap di sini, tidak perlu diubah)
        const host = hostRef.current;
    if (!host) return;
    
    const clock = new THREE.Clock(); 

    let width = host.clientWidth;
    let height = host.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.top = "0";
    cssRenderer.domElement.style.left = "0";
    cssRenderer.domElement.style.pointerEvents = "none";
    host.appendChild(cssRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06; 
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.target.set(0, 4, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(15, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5));

    const floor = new THREE.Mesh( new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: 0.3 }) );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6.5;
    floor.receiveShadow = true;
    scene.add(floor);

    const mat = { panelWhite: new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.6 }), panelBlack: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }), schneiderGreen: new THREE.MeshStandardMaterial({ color: 0x3dcd58, roughness: 0.7 }), switchRed: new THREE.MeshStandardMaterial({ color: 0xff4136, roughness: 0.5 }), screen: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x1a1a1a, roughness: 0.2 }) };
    const panelGroup = new THREE.Group();
    scene.add(panelGroup);
    panelGroup.position.y = -2;

    function createBox(width, height, depth, material, position) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const box = new THREE.Mesh(geometry, material);
        box.position.set(position.x, position.y, position.z);
        box.castShadow = true;
        box.receiveShadow = true;
        return box;
    }
    
    const panelDepth = 4, panelWidth = 7.2, totalTopWidth = panelWidth * 2, leftTopWidth = totalTopWidth / 3 + 2, rightTopWidth = totalTopWidth * 2 / 3 - 2;
    panelGroup.add(createBox(leftTopWidth, 3, panelDepth, mat.panelWhite, { x: (-totalTopWidth / 2) + (leftTopWidth / 2), y: 7.0, z: 0 }), createBox(rightTopWidth, 7, panelDepth, mat.panelWhite, { x: (totalTopWidth / 2) - (rightTopWidth / 2), y: 9.0, z: 0 }));
    panelGroup.add(createBox(panelWidth - 0.2, 4.5, panelDepth - 0.5, mat.panelBlack, { x: -panelWidth / 2, y: 3.25, z: 0.25 }), createBox(panelWidth - 0.2, 4.5, panelDepth - 0.5, mat.panelBlack, { x: panelWidth / 2, y: 3.25, z: 0.25 }));
    panelGroup.add(createBox(panelWidth, 5.5, panelDepth, mat.panelWhite, { x: -panelWidth / 2, y: -1.75, z: 0 }), createBox(panelWidth, 5.5, panelDepth, mat.panelWhite, { x: panelWidth / 2, y: -1.75, z: 0 }));
    panelGroup.add(createBox(4, 5, panelDepth - 1, mat.panelWhite, { x: 0, y: -2.0, z: 1.75 }));
    panelGroup.add(createBox(1.0, 1.0, 0.2, mat.screen, { x: 3.0, y: 10.0, z: panelDepth / 2 + 0.1 }), createBox(2.5, 2.0, 0.2, mat.screen, { x: 5.5, y: 10.0, z: panelDepth / 2 + 0.1 }));
    const mainBreaker = createBox(2, 4, 1.5, mat.panelBlack, { x: 0, y: -2.0, z: 2.75 });
    mainBreaker.add(createBox(0.5, 2.5, 0.3, mat.switchRed, { x: 0, y: 0.3, z: (1.5 / 2) + (0.3 / 2) }));
    panelGroup.add(mainBreaker);
    panelGroup.add(createBox(panelWidth - 0.2, 0.4, 0.1, mat.schneiderGreen, { x: -panelWidth/2, y: 5.7, z: panelDepth / 2 - 0.1 }), createBox(3, 0.2, 0.1, mat.schneiderGreen, { x: -5.5, y: 1.2, z: panelDepth / 2 + 0.1 }), createBox(3, 0.2, 0.1, mat.schneiderGreen, { x: 5.5, y: 1.2, z: panelDepth / 2 + 0.1 }));

    const pmEl = document.createElement("div");
    pmEl.style.width = "280px";
    pmEl.style.pointerEvents = "auto";
    pmEl.style.userSelect = "none";
    pmEl.style.fontFamily = "'Orbitron', sans-serif";
    pmEl.style.transition = "opacity 0.3s";
    pmEl.innerHTML = `<div id="pm-root" style="position: relative; width:100%; background:rgba(210, 210, 210, 0.8); border:3px solid rgba(10,10,10,0.4); border-radius:10px; padding:10px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.4);"><div id="pm-screen" style="background:rgba(205, 220, 57, 0.95); padding:15px; border-radius:5px; border:2px inset #aaa; text-align:right; height:70px; display:flex; flex-direction:column; justify-content:center; transition: background-color 0.3s;"><div id="pm-title" style="font-size:14px; text-align:left; margin-bottom:5px; color:#333; font-weight:400;"></div><div style="display:flex; justify-content:flex-end; align-items:baseline;"><span id="pm-value" style="font-size:28px; font-weight:700;">0.00</span><span id="pm-unit" style="font-size:16px; margin-left:5px; font-weight:700;"></span></div></div><div style="display:flex; justify-content:space-between; margin-top:10px;"><button id="pm-prev" style="background:#444; color:white; border:1px solid #666; border-radius:5px; padding:5px 15px; cursor:pointer; font-size:18px;">◄</button><button id="pm-next" style="background:#444; color:white; border:1px solid #666; border-radius:5px; padding:5px 15px; cursor:pointer; font-size:18px;">►</button></div><div id="pm-error-overlay" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(211, 47, 47, 0.85); border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; text-align:center; padding:10px; pointer-events:none;"><svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="white" stroke-width="1.5"/><path d="M9 9L7 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M7 9L9 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M15 9L13 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M13 9L15 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M17.5 17.5L20.5 20.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg><div id="pm-error-message" style="font-weight:700; font-size:14px; margin-top:8px;"></div></div></div>`;
    const pmObject = new CSS3DObject(pmEl);
    pmObject.position.set(0, 4.5, 4.5);
    pmObject.scale.set(0.04, 0.04, 0.04);
    panelGroup.add(pmObject);

    const pmPrevBtn = pmEl.querySelector("#pm-prev");
    const pmNextBtn = pmEl.querySelector("#pm-next");
    const prevHandler = () => setCurrentIndex(prev => (prev - 1 + pmDisplayConfig.length) % pmDisplayConfig.length);
    const nextHandler = () => setCurrentIndex(prev => (prev + 1) % pmDisplayConfig.length);
    pmPrevBtn.addEventListener('click', prevHandler);
    pmNextBtn.addEventListener('click', nextHandler);
    
    let isUserInteracting = false, needsReset = false, interactionTimeout;
    const swingAngle = THREE.MathUtils.degToRad(30), swingSpeed = 0.5;
    let swingStartTime = 0;

    const startResetTimer = () => { clearTimeout(interactionTimeout); interactionTimeout = setTimeout(() => { isUserInteracting = false; needsReset = true; }, 3000); };
    const onInteractionStart = () => { isUserInteracting = true; needsReset = false; clearTimeout(interactionTimeout); };
    const onInteractionEnd = () => { startResetTimer(); };
    controls.addEventListener('start', onInteractionStart);
    controls.addEventListener('end', onInteractionEnd);

    const ro = new ResizeObserver(() => {
        width = host.clientWidth;
        height = host.clientHeight || 400;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        cssRenderer.setSize(width, height);
    });
    ro.observe(host);

    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      if (!isUserInteracting) {
        if (needsReset) {
          panelGroup.rotation.y = THREE.MathUtils.lerp(panelGroup.rotation.y, 0, 0.05);
          if (Math.abs(panelGroup.rotation.y) < 0.01) {
            panelGroup.rotation.y = 0;
            needsReset = false;
            swingStartTime = elapsedTime;
          }
        } else {
          const swingTime = elapsedTime - swingStartTime;
          panelGroup.rotation.y = Math.sin(swingTime * swingSpeed) * swingAngle;
        }
      }
      const panelDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(panelGroup.quaternion);
      const cameraDirection = new THREE.Vector3().subVectors(camera.position, panelGroup.position).normalize();
      const dotProduct = panelDirection.dot(cameraDirection);
      pmEl.style.opacity = (dotProduct > 0.1) ? '1' : '0';
      pmEl.style.pointerEvents = (dotProduct > 0.1) ? 'auto' : 'none';
      controls.update();
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
    }
    animate();

    return () => {
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
        controls.removeEventListener('start', onInteractionStart);
        controls.removeEventListener('end', onInteractionEnd);
        pmPrevBtn.removeEventListener('click', prevHandler);
        pmNextBtn.removeEventListener('click', nextHandler);
        if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
        if (host.contains(cssRenderer.domElement)) host.removeChild(cssRenderer.domElement);
        renderer.dispose();
        scene.traverse(o => { if (o.isMesh) { o.geometry?.dispose(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material?.dispose(); } });
    };
  }, []);

  // ✅ [MODIFIKASI 2] useEffect terpisah untuk MENDETEKSI anomali
  useEffect(() => {
    if (!firebaseData) {
      setAnomalies([]);
      return;
    }
    
    // Fungsi helper untuk menghitung nilai
    const getValue = (data, item) => {
        if (item.key === 'Vavg_calc') {
            const v1 = data['V1'] ?? 0;
            const v2 = data['V2'] ?? 0;
            const v3 = data['V3'] ?? 0;
            return (v1 + v2 + v3) / 3;
        }
        return data[item.key] ?? 0;
    };

    // Temukan semua anomali dari data terbaru
    const foundAnomalies = pmDisplayConfig.filter(item => {
      const value = getValue(firebaseData, item);
      return value < item.min || value > item.max;
    });

    // Cek apakah daftar anomali benar-benar berubah sebelum update state
    // Ini mencegah loop render yang tidak perlu
    if (JSON.stringify(foundAnomalies) !== JSON.stringify(anomalies)) {
      setAnomalies(foundAnomalies);
      setAnomalyIndex(0); // PENTING: Reset siklus ke awal saat daftar anomali berubah
    }
  }, [firebaseData, pmDisplayConfig, anomalies]); // Dependensi ditambahkan

  // useEffect untuk SIKLUS anomali (tidak berubah)
  useEffect(() => {
    if (anomalies.length > 1) {
      const intervalId = setInterval(() => {
        setAnomalyIndex(prev => (prev + 1) % anomalies.length);
      }, 2000); // Ganti peringatan setiap 2 detik

      return () => clearInterval(intervalId);
    }
  }, [anomalies]);

  // ✅ [MODIFIKASI 3] useEffect terpisah untuk MENAMPILKAN UI
  useEffect(() => {
    const pmTitleEl = document.getElementById('pm-title');
    const pmValueEl = document.getElementById('pm-value');
    const pmUnitEl = document.getElementById('pm-unit');
    const pmScreenEl = document.getElementById('pm-screen');
    const pmErrorOverlayEl = document.getElementById('pm-error-overlay');
    const pmErrorMessageEl = document.getElementById('pm-error-message');

    if (!pmTitleEl) return;

    const getValue = (data, item) => {
        if (!data || !item) return 0;
        if (item.key === 'Vavg_calc') {
            const v1 = data['V1'] ?? 0, v2 = data['V2'] ?? 0, v3 = data['V3'] ?? 0;
            return (v1 + v2 + v3) / 3;
        }
        return data[item.key] ?? 0;
    };
    
    if (error) {
        pmTitleEl.textContent = "Error";
        pmValueEl.textContent = ":(";
        pmScreenEl.style.backgroundColor = 'rgba(255, 82, 82, 0.95)';
        pmErrorOverlayEl.style.display = 'flex';
        pmErrorMessageEl.textContent = error;
        return;
    }
    if (isLoading) {
        pmTitleEl.textContent = "Connecting...";
        pmValueEl.textContent = "--";
        pmScreenEl.style.backgroundColor = 'rgba(158, 158, 158, 0.95)';
        pmErrorOverlayEl.style.display = 'none';
        return;
    }
    if (!firebaseData) {
        pmTitleEl.textContent = "No Data";
        pmValueEl.textContent = "N/A";
        pmScreenEl.style.backgroundColor = 'rgba(158, 158, 158, 0.95)';
        pmErrorOverlayEl.style.display = 'none';
        return;
    }

    if (anomalies.length > 0) {
      // Jika ada anomali, tampilkan anomali yang aktif dalam siklus
      const currentAnomaly = anomalies[anomalyIndex];
      const value = getValue(firebaseData, currentAnomaly);
      
      pmTitleEl.textContent = currentAnomaly.title;
      pmValueEl.textContent = isNaN(value) ? '0.00' : value.toFixed(currentAnomaly.decimals);
      pmUnitEl.textContent = currentAnomaly.unit;
      
      pmScreenEl.style.backgroundColor = 'rgba(255, 82, 82, 0.95)';
      pmErrorOverlayEl.style.display = 'flex';
      pmErrorMessageEl.textContent = `ANOMALY: ${currentAnomaly.title}`;
    } else {
      // Jika tidak ada anomali, tampilkan data normal
      const currentDisplay = pmDisplayConfig[currentIndex];
      const value = getValue(firebaseData, currentDisplay);
      
      pmTitleEl.textContent = currentDisplay.title;
      pmValueEl.textContent = isNaN(value) ? '0.00' : value.toFixed(currentDisplay.decimals);
      pmUnitEl.textContent = currentDisplay.unit;
      
      pmScreenEl.style.backgroundColor = 'rgba(205, 220, 57, 0.95)';
      pmErrorOverlayEl.style.display = 'none';
    }
  }, [firebaseData, currentIndex, anomalies, anomalyIndex, isLoading, error, pmDisplayConfig]);

  return (
    <div
      ref={hostRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "400px",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    />
  );
}