import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

// --- Firebase Integration (Digabungkan dalam satu file) ---
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Konfigurasi Firebase RTDB Anda
const firebaseConfigRTDB = {
  apiKey: "AIzaSyDsM-j-nbNPMdTz1irbXOXD1b8bS_mjrPk",
  databaseURL: "https://monitoring123-b4e41-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Inisialisasi aplikasi khusus RTDB
const rtdbApp = initializeApp(firebaseConfigRTDB, "rtdbApp");
const dbRTDB = getDatabase(rtdbApp);
const authRTDB = getAuth(rtdbApp);

// Fungsi login anonim sekali jalan
const loginRTDB = async () => {
  try {
    if (authRTDB.currentUser) return; // Jika sudah login, tidak perlu login lagi
    await signInAnonymously(authRTDB);
    console.log("✅ Login anonim ke RTDB berhasil");
  } catch (error) {
    console.error("❌ Gagal login RTDB:", error.message);
  }
};
// --- End of Firebase Integration ---

/**
 * Komponen SchneiderPanel 3D Interaktif dengan data Realtime Firebase.
 * - Menggunakan WebGLRenderer untuk model 3D dan CSS3DRenderer untuk overlay UI.
 * - Mengambil data dari Firebase RTDB dan menampilkannya di display panel.
 * - Mendeteksi anomali berdasarkan ambang batas yang ditentukan.
 *
 * Cara Penggunaan:
 * <div style={{ width: '100%', height: '600px' }}>
 * <SchneiderPanel />
 * </div>
 */
export default function SchneiderPanel() {
  const hostRef = useRef(null);
  const rafRef = useRef(null);
  const [firebaseData, setFirebaseData] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Daftar data yang akan ditampilkan di panel, beserta batas anomali
  const pmDisplayConfig = [
    { key: "Vavg", title: "Tegangan Rata-rata", unit: "V", min: 11000, max: 22000, decimals: 2 },
    { key: "Iavg", title: "Arus Rata-rata", unit: "A", min: 0, max: 10, decimals: 4 },
    { key: "Ptot", title: "Daya Total", unit: "kW", min: 0, max: 1000, decimals: 4 },
    { key: "Edel", title: "Energi Terpakai", unit: "kWh", min: -Infinity, max: Infinity, decimals: 2 },
    { key: "v1", title: "Tegangan Fase 1", unit: "V", min: 19000, max: 22000, decimals: 2 },
    { key: "v2", title: "Tegangan Fase 2", unit: "V", min: 19000, max: 22000, decimals: 2 },
    { key: "v3", title: "Tegangan Fase 3", unit: "V", min: 19000, max: 22000, decimals: 2 },
  ];

  // 1. useEffect untuk mengambil data dari Firebase
  useEffect(() => {
    const fetchData = async () => {
      await loginRTDB();
      const sensorRef = ref(dbRTDB, "sensor_data");

      const unsubscribe = onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("📡 Data sensor realtime diterima:", data);
          setFirebaseData(data);
        } else {
          console.log("⚠️ Data sensor tidak ditemukan di Firebase.");
        }
      });

      return () => unsubscribe();
    };

    fetchData();
  }, []);


  // 2. useEffect untuk setup scene Three.js dan UI
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    
    // --- Inisialisasi Three.js ---
    let width = host.clientWidth;
    let height = host.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = null; // Transparan

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

    const controls = new OrbitControls(camera, cssRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.target.set(0, 4, 0);
    controls.enableZoom = false;

    // --- Pencahayaan ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(15, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5));

    // --- Lantai Bayangan ---
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Material ---
    const mat = {
        panelWhite: new THREE.MeshStandardMaterial({ color: 0xe5e5e5, roughness: 0.6 }),
        panelBlack: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
        schneiderGreen: new THREE.MeshStandardMaterial({ color: 0x3dcd58, roughness: 0.7 }),
        switchRed: new THREE.MeshStandardMaterial({ color: 0xff4136, roughness: 0.5 }),
        screen: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x1a1a1a, roughness: 0.2 }),
    };

    // --- Geometri Panel ---
    const panelGroup = new THREE.Group();
    scene.add(panelGroup);
    panelGroup.position.y = -1;

    function createBox(width, height, depth, material, position) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const box = new THREE.Mesh(geometry, material);
        box.position.set(position.x, position.y, position.z);
        box.castShadow = true;
        box.receiveShadow = true;
        return box;
    }
    
    const panelDepth = 4;
    const panelWidth = 7.2;
    const totalTopWidth = panelWidth * 2;
    const leftTopWidth = totalTopWidth / 3 + 2;
    const rightTopWidth = totalTopWidth * 2 / 3 - 2;
    
    const topLeftPanel = createBox(leftTopWidth, 3, panelDepth, mat.panelWhite, { x: (-totalTopWidth / 2) + (leftTopWidth / 2), y: 7.0, z: 0 });
    const topRightPanel = createBox(rightTopWidth, 7, panelDepth, mat.panelWhite, { x: (totalTopWidth / 2) - (rightTopWidth / 2), y: 9.0, z: 0 });
    panelGroup.add(topLeftPanel, topRightPanel);
    
    const middleLeftBlack = createBox(panelWidth - 0.2, 4.5, panelDepth - 0.5, mat.panelBlack, { x: -panelWidth / 2, y: 3.25, z: 0.25 });
    const middleRightBlack = createBox(panelWidth - 0.2, 4.5, panelDepth - 0.5, mat.panelBlack, { x: panelWidth / 2, y: 3.25, z: 0.25 });
    panelGroup.add(middleLeftBlack, middleRightBlack);

    const bottomLeft = createBox(panelWidth, 5.5, panelDepth, mat.panelWhite, { x: -panelWidth / 2, y: -1.75, z: 0 });
    const bottomRight = createBox(panelWidth, 5.5, panelDepth, mat.panelWhite, { x: panelWidth / 2, y: -1.75, z: 0 });
    panelGroup.add(bottomLeft, bottomRight);

    const bottomMiddleRecess = createBox(4, 5, panelDepth - 1, mat.panelWhite, { x: 0, y: -2.0, z: 1.75 });
    panelGroup.add(bottomMiddleRecess);
    
    const meter1 = createBox(1.0, 1.0, 0.2, mat.screen, { x: 3.0, y: 10.0, z: panelDepth / 2 + 0.1 });
    const meter2 = createBox(2.5, 2.0, 0.2, mat.screen, { x: 5.5, y: 10.0, z: panelDepth / 2 + 0.1 });
    panelGroup.add(meter1, meter2);
    
    const mainBreaker = createBox(2, 4, 1.5, mat.panelBlack, { x: 0, y: -2.0, z: 2.75 });
    const breakerSwitch = createBox(0.5, 2.5, 0.3, mat.switchRed, { x: 0, y: 0.3, z: (1.5 / 2) + (0.3 / 2) });
    mainBreaker.add(breakerSwitch);
    panelGroup.add(mainBreaker);


    // --- CSS3D Object untuk Display ---
    const pmEl = document.createElement("div");
    pmEl.style.width = "280px"; // Sedikit lebih lebar
    pmEl.style.pointerEvents = "auto";
    pmEl.style.userSelect = "none";
    pmEl.style.fontFamily = "'Orbitron', sans-serif";
    pmEl.style.transition = "opacity 0.3s";
    
    pmEl.innerHTML = `
      <div id="pm-root" style="position: relative; width:100%; background:rgba(210, 210, 210, 0.8); border:3px solid rgba(10,10,10,0.4); border-radius:10px; padding:10px; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
        <div id="pm-screen" style="background:rgba(205, 220, 57, 0.95); padding:15px; border-radius:5px; border:2px inset #aaa; text-align:right; height:70px; display:flex; flex-direction:column; justify-content:center; transition: background-color 0.3s;">
          <div id="pm-title" style="font-size:14px; text-align:left; margin-bottom:5px; color:#333; font-weight:400;"></div>
          <div style="display:flex; justify-content:flex-end; align-items:baseline;">
            <span id="pm-value" style="font-size:28px; font-weight:700;">0.00</span>
            <span id="pm-unit" style="font-size:16px; margin-left:5px; font-weight:700;"></span>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:10px;">
          <button id="pm-prev" style="background:#444; color:white; border:1px solid #666; border-radius:5px; padding:5px 15px; cursor:pointer; font-size:18px;">◄</button>
          <button id="pm-next" style="background:#444; color:white; border:1px solid #666; border-radius:5px; padding:5px 15px; cursor:pointer; font-size:18px;">►</button>
        </div>
        <div id="pm-error-overlay" style="display:none; position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(211, 47, 47, 0.85); border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; text-align:center; padding:10px; pointer-events:none;">
          <svg width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="white" stroke-width="1.5"/><path d="M9 9L7 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M7 9L9 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M15 9L13 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M13 9L15 11" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M17.5 17.5L20.5 20.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
          <div id="pm-error-message" style="font-weight:700; font-size:14px; margin-top:8px;"></div>
        </div>
      </div>
    `;

    const pmObject = new CSS3DObject(pmEl);
    pmObject.position.set(0, 4.5, 4.5); // Maju sedikit agar tidak tertutup
    pmObject.scale.set(0.04, 0.04, 0.04);
    panelGroup.add(pmObject);

    // --- Event Listeners untuk Tombol Navigasi ---
    const pmPrevBtn = pmEl.querySelector("#pm-prev");
    const pmNextBtn = pmEl.querySelector("#pm-next");

    const prevHandler = () => setCurrentIndex(prev => (prev - 1 + pmDisplayConfig.length) % pmDisplayConfig.length);
    const nextHandler = () => setCurrentIndex(prev => (prev + 1) % pmDisplayConfig.length);

    pmPrevBtn.addEventListener('click', prevHandler);
    pmNextBtn.addEventListener('click', nextHandler);
    
    // --- Kontrol Kamera & Interaksi ---
    let targetDistance = camera.position.distanceTo(controls.target);
    let isUserInteracting = false;
    let needsReset = false;
    let interactionTimeout;

    const onWheel = (event) => {
        isUserInteracting = true;
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(() => { isUserInteracting = false; needsReset = true; }, 3000);
        const zoomAmount = event.deltaY * 0.005;
        targetDistance = THREE.MathUtils.clamp(targetDistance + zoomAmount * targetDistance, controls.minDistance, controls.maxDistance);
    };
    host.addEventListener('wheel', onWheel, { passive: false });

    const onInteractionStart = () => {
        isUserInteracting = true;
        needsReset = false;
        clearTimeout(interactionTimeout);
    };
    const onInteractionEnd = () => {
        clearTimeout(interactionTimeout);
        interactionTimeout = setTimeout(() => { isUserInteracting = false; needsReset = true; }, 3000);
    };
    controls.addEventListener('start', onInteractionStart);
    controls.addEventListener('end', onInteractionEnd);

    // --- Resize Observer ---
    const ro = new ResizeObserver(() => {
        width = host.clientWidth;
        height = host.clientHeight || 400;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        cssRenderer.setSize(width, height);
    });
    ro.observe(host);

    // --- Animation Loop ---
    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      // Smooth zoom
      const currentDistance = camera.position.distanceTo(controls.target);
      const smoothedDistance = THREE.MathUtils.lerp(currentDistance, targetDistance, 0.08);
      const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(direction, smoothedDistance);
      
      // Auto-rotate or reset
      if (needsReset) {
          panelGroup.rotation.y = THREE.MathUtils.lerp(panelGroup.rotation.y, 0, 0.05);
          if (Math.abs(panelGroup.rotation.y) < 0.01) {
              panelGroup.rotation.y = 0;
              needsReset = false;
          }
      } else if (!isUserInteracting) {
          panelGroup.rotation.y += 0.002; // Perlambat rotasi
      }

      // Tampilkan/sembunyikan display berdasarkan sudut pandang
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

    // --- Cleanup ---
    return () => {
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
        host.removeEventListener('wheel', onWheel);
        controls.removeEventListener('start', onInteractionStart);
        controls.removeEventListener('end', onInteractionEnd);
        pmPrevBtn.removeEventListener('click', prevHandler);
        pmNextBtn.removeEventListener('click', nextHandler);
        
        if (host) {
            host.removeChild(renderer.domElement);
            host.removeChild(cssRenderer.domElement);
        }
        
        renderer.dispose();
        scene.traverse(o => {
            if (o.isMesh) {
                o.geometry?.dispose();
                if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                else o.material?.dispose();
            }
        });
    };
  }, []); // Hanya dijalankan sekali saat mount

  // 3. useEffect untuk update UI display berdasarkan data Firebase
  useEffect(() => {
      const pmTitleEl = document.getElementById('pm-title');
      const pmValueEl = document.getElementById('pm-value');
      const pmUnitEl = document.getElementById('pm-unit');
      const pmScreenEl = document.getElementById('pm-screen');
      const pmErrorOverlayEl = document.getElementById('pm-error-overlay');
      const pmErrorMessageEl = document.getElementById('pm-error-message');

      if (!pmTitleEl || !firebaseData) return;

      const currentDisplay = pmDisplayConfig[currentIndex];
      const value = firebaseData[currentDisplay.key] ?? 0;
      const isAnomalous = value < currentDisplay.min || value > currentDisplay.max;
      
      // Cek anomali secara keseluruhan
      let overallAnomaly = null;
      for(const item of pmDisplayConfig) {
          const val = firebaseData[item.key] ?? 0;
          if (val < item.min || val > item.max) {
              overallAnomaly = item;
              break;
          }
      }

      pmTitleEl.textContent = currentDisplay.title;
      pmValueEl.textContent = value.toFixed(currentDisplay.decimals);
      pmUnitEl.textContent = currentDisplay.unit;

      if (overallAnomaly) {
          pmScreenEl.style.backgroundColor = 'rgba(255, 82, 82, 0.95)';
          pmErrorOverlayEl.style.display = 'flex';
          pmErrorMessageEl.textContent = `ANOMALI: ${overallAnomaly.title}`;
      } else {
          pmScreenEl.style.backgroundColor = 'rgba(205, 220, 57, 0.95)';
          pmErrorOverlayEl.style.display = 'none';
      }

  }, [firebaseData, currentIndex, pmDisplayConfig]);

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
