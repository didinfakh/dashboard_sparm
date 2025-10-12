// SchneiderPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { db, db2, dbDatabase } from "../Firebase";
import { onValue, ref } from "firebase/database";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

/**
 * SchneiderPanel
 * - Responsive: menyesuaikan parent (w-full)
 * - Menggunakan WebGLRenderer + CSS3DRenderer untuk overlay HTML (navigasi + error)
 * - Canvas texture pada layar untuk menampilkan angka yang up-to-date (mirip display PM)
 *
 * Cara pakai:
 * <div style={{ width: '100%', height: 600 }}>
 *   <SchneiderPanel />
 * </div>
 */
export default function SchneiderPanel() {
  const screenCanvasRef = useRef(null);
  const screenTextureRef = useRef(null);

  const hostRef = useRef(null);
  const rafRef = useRef(null);
  const [panelData, setPanelData] = useState({});
  const [monthSumarry, setMonthSumarry] = useState([]);

  async function getDatabase() {
    // const snapshot = await getDocs(
    //   collection(dbDatabase, "monthly_forecast_summary")
    // );
    // console.log(snapshot.docs.map((doc) => doc.data()));
    try {
      const q = query(
        collection(dbDatabase, "monthly_forecast_summary"),
        orderBy("created_at", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      console.log(snapshot);
      const data = snapshot.docs.map((doc) => doc.data());
      console.log("Data terakhir:", data);
      setMonthSumarry(data);
    } catch (error) {
      console.error("Gagal ambil data Firestore:", error);
    }
  }
  useEffect(() => {
    console.log("Fetching data from Firebase...");
    getDatabase();
    const panelRef = ref(db2, "sensor_data");

    const unsubscribe = onValue(
      panelRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("ini adalah console.log data dari firebase");
          console.log(data);
          setPanelData(data);
        }
      },
      (error) => {
        console.error("Error membaca data:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // add Orbitron font link (optional, untuk style mirip device)
    const fontLinkId = "orbitron-google-font";
    if (!document.getElementById(fontLinkId)) {
      const link = document.createElement("link");
      link.id = fontLinkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap";
      document.head.appendChild(link);
    }

    const host = hostRef.current;
    if (!host) return;

    // sizes
    let width = host.clientWidth;
    let height = host.clientHeight || 400;

    // scene + camera + renderers
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.top = "0";
    cssRenderer.domElement.style.left = "0";
    cssRenderer.domElement.style.pointerEvents = "none"; // default none; each CSS3DObject element sets its own pointerEvents
    host.appendChild(cssRenderer.domElement);

    // controls
    const controls = new OrbitControls(camera, cssRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.target.set(0, 4, 0);
    controls.enableZoom = false; // use wheel handler custom zoom
    controls.rotateSpeed = 0.6;

    // lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(15, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5));

    // floor (shadow)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6;
    floor.receiveShadow = true;
    scene.add(floor);

    // materials
    const mat = {
      panelWhite: new THREE.MeshStandardMaterial({
        color: 0xe5e5e5,
        roughness: 0.6,
      }),
      panelBlack: new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
      }),
      schneiderGreen: new THREE.MeshStandardMaterial({
        color: 0x3dcd58,
        roughness: 0.6,
      }),
      switchRed: new THREE.MeshStandardMaterial({
        color: 0xff4136,
        roughness: 0.5,
      }),
      screenMat: new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0x0a0a0a,
        roughness: 0.2,
      }),
    };

    // helper to create boxes
    function box(w, h, d, material, x, y, z, rx = 0, ry = 0, rz = 0) {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, material);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    const panelGroup = new THREE.Group();
    scene.add(panelGroup);
    panelGroup.position.y = -1;

    // build approximate model (more pieces to approach reference)
    const panelWidth = 7.2;
    const panelDepth = 4;

    // top panels
    const totalTopWidth = panelWidth * 2;
    const leftTopWidth = totalTopWidth / 3 + 2;
    const rightTopWidth = (totalTopWidth * 2) / 3 - 2;

    const topLeft = box(
      leftTopWidth,
      3,
      panelDepth,
      mat.panelWhite,
      -totalTopWidth / 2 + leftTopWidth / 2,
      7.0,
      0
    );
    const topRight = box(
      rightTopWidth,
      7,
      panelDepth,
      mat.panelWhite,
      totalTopWidth / 2 - rightTopWidth / 2,
      9.0,
      0
    );
    panelGroup.add(topLeft, topRight);

    // middle black blocks (the tall black central parts in reference)
    const middleY = 3.25;
    const middleLeftBlack = box(
      panelWidth - 0.25,
      4.5,
      panelDepth - 0.6,
      mat.panelBlack,
      -panelWidth / 2,
      middleY,
      0.25
    );
    const middleRightBlack = box(
      panelWidth - 0.25,
      4.5,
      panelDepth - 0.6,
      mat.panelBlack,
      panelWidth / 2,
      middleY,
      0.25
    );
    panelGroup.add(middleLeftBlack, middleRightBlack);

    // bottom panels
    const bottomY = -1.75;
    const bottomLeft = box(
      panelWidth,
      5.5,
      panelDepth,
      mat.panelWhite,
      -panelWidth / 2,
      bottomY,
      0
    );
    const bottomRight = box(
      panelWidth,
      5.5,
      panelDepth,
      mat.panelWhite,
      panelWidth / 2,
      bottomY,
      0
    );
    panelGroup.add(bottomLeft, bottomRight);

    // bottom middle recess
    const bottomMiddleRecess = box(
      4,
      5,
      panelDepth - 1,
      mat.panelWhite,
      0,
      -2.0,
      1.8
    );
    panelGroup.add(bottomMiddleRecess);

    // slots & labels
    const slot1 = box(
      1,
      1.5,
      0.1,
      mat.panelBlack,
      -5.5,
      -0.5,
      panelDepth / 2 + 0.1
    );
    const slot2 = box(
      1,
      1.5,
      0.1,
      mat.panelBlack,
      -5.5,
      -3.0,
      panelDepth / 2 + 0.1
    );
    const slot3 = box(
      1,
      1.5,
      0.1,
      mat.panelBlack,
      5.5,
      0,
      panelDepth / 2 + 0.1
    );
    const slot4 = box(
      1,
      1.5,
      0.1,
      mat.panelBlack,
      5.5,
      -2.5,
      panelDepth / 2 + 0.1
    );
    panelGroup.add(slot1, slot2, slot3, slot4);

    // main breaker + switch
    const mainBreaker = box(2, 4, 1.5, mat.panelBlack, 0, -2.0, 2.75);
    const breakerSwitch = box(
      0.5,
      2.5,
      0.3,
      mat.switchRed,
      0,
      0.3,
      1.5 / 2 + 0.18
    );
    mainBreaker.add(breakerSwitch);
    panelGroup.add(mainBreaker);

    // green labels (thin strips)
    const greenTop = box(
      panelWidth - 0.2,
      0.38,
      0.1,
      mat.schneiderGreen,
      -panelWidth / 2,
      5.7,
      panelDepth / 2 - 0.1
    );
    const greenBotLeft = box(
      3,
      0.2,
      0.1,
      mat.schneiderGreen,
      -5.5,
      1.2,
      panelDepth / 2 + 0.1
    );
    const greenBotRight = box(
      3,
      0.2,
      0.1,
      mat.schneiderGreen,
      5.5,
      1.2,
      panelDepth / 2 + 0.1
    );
    panelGroup.add(greenTop, greenBotLeft, greenBotRight);

    // small front displays (two tiny screens)
    const meter1 = box(
      1.0,
      1.0,
      0.2,
      mat.screenMat,
      3.0,
      10.0,
      panelDepth / 2 + 0.12
    );
    const meter2 = box(
      2.5,
      2.0,
      0.2,
      mat.screenMat,
      5.5,
      10.0,
      panelDepth / 2 + 0.12
    );
    panelGroup.add(meter1, meter2);

    // Create a screen plane with a dynamic canvas texture (to show numbers similar to PM)
    // const screenCanvas = document.createElement("canvas");
    // screenCanvas.width = 800;
    // screenCanvas.height = 360;
    // const sctx = screenCanvas.getContext("2d");

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 800;
    screenCanvas.height = 360;
    const sctx = screenCanvas.getContext("2d");
    screenCanvasRef.current = screenCanvas; // 🔹 simpan referensi

    function drawScreenText(
      valueStr = "221.4",
      title = "Average Voltage",
      unit = "V"
    ) {
      // background

      sctx.fillStyle = "#d9ea19"; // yellow-green
      sctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      // subtle inner bezel
      sctx.fillStyle = "rgba(0,0,0,0.06)";
      sctx.fillRect(8, 8, screenCanvas.width - 16, screenCanvas.height - 16);

      // title
      sctx.fillStyle = "#111";
      sctx.font = "36px Orbitron, sans-serif";
      sctx.textAlign = "left";
      sctx.fillText(title, 30, 70);

      // big value
      sctx.font = "bold 120px Orbitron, sans-serif";
      sctx.textAlign = "right";
      sctx.fillText(valueStr, screenCanvas.width - 50, 220);

      // unit small
      sctx.font = "36px Orbitron, sans-serif";
      sctx.fillText(unit, screenCanvas.width - 30, 280);
    }

    // initial draw
    // drawScreenText("221.3", "Average Voltage", "V");

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTextureRef.current = screenTexture;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.needsUpdate = true;

    // screen plane and bezel
    const screenPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 2.5),
      new THREE.MeshStandardMaterial({
        map: screenTexture,
        roughness: 0.1,
        emissive: 0x111111,
      })
    );
    screenPlane.position.set(0, 4.5, panelDepth / 2 + 0.12);
    panelGroup.add(screenPlane);

    // bezel frame (slightly rounded effect by layered boxes)
    const bezelOuter = box(
      5.8,
      3.0,
      0.25,
      mat.panelWhite,
      0,
      4.5,
      panelDepth / 2 + 0.06
    );
    panelGroup.add(bezelOuter);
    const bezelInner = box(
      5.6,
      2.8,
      0.26,
      mat.panelBlack,
      0,
      4.5,
      panelDepth / 2 + 0.07
    );
    panelGroup.add(bezelInner);

    // small left & right nav button meshes (visual only)
    const btnLeft = box(
      0.9,
      0.6,
      0.15,
      mat.panelBlack,
      -1.6,
      2.6,
      panelDepth / 2 + 0.14
    );
    const btnRight = box(
      0.9,
      0.6,
      0.15,
      mat.panelBlack,
      1.6,
      2.6,
      panelDepth / 2 + 0.14
    );
    panelGroup.add(btnLeft, btnRight);

    // make CSS3D powermeter element (interactive overlay attached to same position)
    const pmEl = document.createElement("div");
    pmEl.style.width = "360px";
    pmEl.style.maxWidth = "60vw";
    pmEl.style.borderRadius = "10px";
    pmEl.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";
    pmEl.style.pointerEvents = "auto"; // allow clicks
    pmEl.style.userSelect = "none";
    pmEl.style.fontFamily = "Orbitron, sans-serif";

    // inner HTML (replicates the HTML UI you had)
    pmEl.innerHTML = `
      <div id="pm-root" style="width:100%;background:rgba(210,210,210,0.88);border:3px solid rgba(10,10,10,0.38);border-radius:10px;padding:10px;box-sizing:border-box;">
        <div id="pm-screen" style="background:rgba(205,220,57,0.98);padding:14px;border-radius:6px;border:2px inset #aaa;text-align:right;height:86px;display:flex;flex-direction:column;justify-content:center;transition:background-color 0.2s;">
          <div id="pm-title" style="font-size:14px;text-align:left;margin-bottom:6px;color:#333">Average Voltage</div>
          <div id="pm-value-container" style="display:flex;justify-content:flex-end;align-items:baseline">
            <span id="pm-value" style="font-size:36px;font-weight:700"></span>
            <span id="pm-unit" style="font-size:16px;margin-left:8px;font-weight:700">V</span>
          </div>
        </div>
        <div id="pm-nav" style="display:flex;justify-content:space-between;margin-top:10px">
          <button id="pm-prev" style="background:#444;color:#fff;border:1px solid #666;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:16px">◄</button>
          <button id="pm-next" style="background:#444;color:#fff;border:1px solid #666;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:16px">►</button>
        </div>
        <div id="pm-error-overlay" style="display:none;position:absolute;left:0;top:0;right:0;bottom:0;background:rgba(211,47,47,0.85);border-radius:10px;align-items:center;justify-content:center;color:white;text-align:center;pointer-events:none;padding:10px">
          <div id="pm-error-message" style="font-weight:700;font-size:14px"></div>
        </div>
      </div>
    `;

    // Put pmEl into a CSS3DObject
    const pmObj = new CSS3DObject(pmEl);
    // position roughly matching 3D screen
    pmObj.position.set(0, 4.5, 4);

    pmObj.scale.set(0.03, 0.03, 0.03);
    panelGroup.add(pmObj);

    // access elements for behavior
    const pmTitle = pmEl.querySelector("#pm-title");
    const pmValue = pmEl.querySelector("#pm-value");
    const pmUnit = pmEl.querySelector("#pm-unit");
    const pmPrev = pmEl.querySelector("#pm-prev");
    const pmNext = pmEl.querySelector("#pm-next");
    const pmRoot = pmEl.querySelector("#pm-root");
    const pmScreen = pmEl.querySelector("#pm-screen");
    const pmError = pmEl.querySelector("#pm-error-overlay");
    const pmErrorMsg = pmEl.querySelector("#pm-error-message");

    // set pointer events on cssRenderer dom so interactions work for pmEl children
    cssRenderer.domElement.style.pointerEvents = "auto";

    // PM data definition (close to original)
    const pmData = [
      {
        title: "Average Voltage",
        unit: "V",
        base: 220,
        variation: 2,
        min: 215,
        max: 225,
      },
      {
        title: "Average Current",
        unit: "A",
        base: 4.38,
        variation: 0.8,
        min: 1.0,
        max: 7.0,
      },
      {
        title: "Total Power",
        unit: "kW",
        base: 140.7,
        variation: 20,
        min: 0,
        max: 180,
      },
      {
        title: "Energy Consumed",
        unit: "kWh",
        base: 206351.23,
        variation: 50,
        min: 0,
        max: 1e9,
      },
      {
        title: "Phase 1 Voltage",
        unit: "V",
        base: 19944.865,
        variation: 100,
        min: 19000,
        max: 21000,
      },
      {
        title: "Phase 2 Voltage",
        unit: "V",
        base: 20548.154,
        variation: 100,
        min: 20000,
        max: 21000,
      },
      {
        title: "Phase 3 Voltage",
        unit: "V",
        base: 19810.431,
        variation: 100,
        min: 19000,
        max: 21000,
      },
    ];

    let currentIndex = 0;
    let anomalyActive = false;
    let anomalyTitle = null;
    const lastVals = pmData.map(() => ({ value: "0", anomalous: false }));

    function genVal(d) {
      const v = d.base + (Math.random() - 0.5) * d.variation;
      const isAnom = v < d.min || v > d.max;
      // decimals logic
      const decimals = Math.abs(d.base) >= 1000 ? 2 : d.base >= 100 ? 1 : 2;
      return {
        valStr: Number(v.toFixed(decimals)).toLocaleString("en-US"),
        anom: isAnom,
        raw: v,
      };
    }

    function updatePMValues() {
      pmData.forEach((d, i) => {
        lastVals[i] = genVal(d);
      });
      const active = lastVals.find((x) => x.anom);
      if (active) {
        anomalyActive = true;
        anomalyTitle = pmData[lastVals.indexOf(active)].title;
      } else {
        anomalyActive = false;
        anomalyTitle = null;
      }
      renderPM();
    }

    function renderPM() {
      const d = pmData[currentIndex];
      console.log("ini adalah panel");
      console.log(panelData);
      const r = lastVals[currentIndex];
      pmTitle.textContent = d.title;
      pmValue.textContent = r.valStr;
      pmUnit.textContent = d.unit;

      // update canvas screen if showing a voltage/phase/current
      // For readability, if numeric is very large (kWh), show condensed
      // if (d.unit === "kWh") {
      //   drawScreenText(r.valStr, d.title, d.unit);
      // } else {
      //   drawScreenText(
      //     r.valStr + (d.unit && d.unit !== "" ? "" : ""),
      //     d.title,
      //     d.unit
      //   );
      // }
      screenTexture.needsUpdate = true;

      if (anomalyActive) {
        pmRoot.classList.add("error-state");
        pmScreen.style.background = "rgba(255,82,82,0.95)";
        pmError.style.display = "flex";
        pmErrorMsg.textContent = `ANOMALY: ${anomalyTitle}`;
      } else {
        pmRoot.classList.remove("error-state");
        pmScreen.style.background = "rgba(205,220,57,0.95)";
        pmError.style.display = "none";
      }
    }

    pmPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + pmData.length) % pmData.length;
      renderPM();
    });
    pmNext.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % pmData.length;
      renderPM();
    });

    // initial generation + periodic update
    // updatePMValues();
    // const pmInterval = setInterval(updatePMValues, 2000);

    // camera distance smoothing via wheel
    let targetDistance = camera.position.distanceTo(controls.target);
    let isInteracting = false;
    let needsReset = false;
    let targetRotY = null;
    let interactionTimeout = null;

    function onWheel(e) {
      e.preventDefault();
      isInteracting = true;
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        isInteracting = false;
        needsReset = true;
      }, 2200);

      const zoomAmount = e.deltaY * 0.004;
      targetDistance += zoomAmount * targetDistance;
      targetDistance = THREE.MathUtils.clamp(
        targetDistance,
        controls.minDistance,
        controls.maxDistance
      );
    }
    host.addEventListener("wheel", onWheel, { passive: false });

    controls.addEventListener("start", () => {
      isInteracting = true;
      needsReset = false;
      targetRotY = null;
      clearTimeout(interactionTimeout);
    });
    controls.addEventListener("end", () => {
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        isInteracting = false;
        needsReset = true;
      }, 2200);
    });

    // visibility logic: show pmEl only when panel faces camera
    const panelDirection = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();

    // responsive: ResizeObserver
    const ro = new ResizeObserver(() => {
      width = host.clientWidth;
      height = host.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      cssRenderer.setSize(width, height);
    });
    ro.observe(host);

    // animation loop
    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      // smooth distance
      const currDist = camera.position.distanceTo(controls.target);
      const smoothed = THREE.MathUtils.lerp(currDist, targetDistance, 0.08);
      const dir = new THREE.Vector3()
        .subVectors(camera.position, controls.target)
        .normalize();
      camera.position.copy(controls.target).addScaledVector(dir, smoothed);

      if (needsReset) {
        if (targetRotY === null) {
          targetRotY =
            Math.round(panelGroup.rotation.y / (Math.PI * 2)) * (Math.PI * 2);
        }
        panelGroup.rotation.y = THREE.MathUtils.lerp(
          panelGroup.rotation.y,
          targetRotY,
          0.05
        );
        if (Math.abs(panelGroup.rotation.y - targetRotY) < 0.01) {
          panelGroup.rotation.y = targetRotY;
          needsReset = false;
          targetRotY = null;
        }
      } else if (!isInteracting) {
        panelGroup.rotation.y += 0.0035;
      }

      // dot product to check facing
      panelDirection.set(0, 0, 1).applyQuaternion(panelGroup.quaternion);
      cameraDirection
        .subVectors(camera.position, panelGroup.position)
        .normalize();
      const dp = panelDirection.dot(cameraDirection);

      if (dp > 0.12) {
        pmEl.style.opacity = "1";
        pmEl.style.pointerEvents = "auto";
      } else {
        pmEl.style.opacity = "0";
        pmEl.style.pointerEvents = "none";
      }

      controls.update();
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
    }
    animate();

    // cleanup on unmount
    return () => {
      ro.disconnect();
      host.removeEventListener("wheel", onWheel);
      // clearInterval(pmInterval);
      cancelAnimationFrame(rafRef.current);

      // remove appended DOM
      try {
        host.removeChild(renderer.domElement);
      } catch (e) {}
      try {
        host.removeChild(cssRenderer.domElement);
      } catch (e) {}

      // dispose three resources
      renderer.dispose();
      screenTexture.dispose();
      // traverse scene dispose geometries & materials
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material))
            o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        }
      });
    };
  }, []);

  // Tambahkan efek baru di bawah Firebase useEffect
  // useEffect(() => {
  //   console.log("Firebase berubah:", panelData);

  //   if (!panelData || Object.keys(panelData).length === 0) return;

  //   const value = panelData.Ptot ?? "0";
  //   const title = "Total Power";
  //   const unit = "kW";

  //   const screenCanvas = Array.from(document.querySelectorAll("canvas")).find(
  //     (c) => c.width === 800 && c.height === 360
  //   );
  //   if (!screenCanvas) return;

  //   const ctx = screenCanvas.getContext("2d");
  //   ctx.fillStyle = "#d9ea19";
  //   ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

  //   ctx.fillStyle = "#111";
  //   ctx.font = "36px Orbitron, sans-serif";
  //   ctx.textAlign = "left";
  //   ctx.fillText(title, 30, 70);

  //   ctx.font = "bold 120px Orbitron, sans-serif";
  //   ctx.textAlign = "right";
  //   ctx.fillText(String(value), screenCanvas.width - 50, 220);

  //   ctx.font = "36px Orbitron, sans-serif";
  //   ctx.fillText(unit, screenCanvas.width - 30, 280);

  //   if (screenCanvas.texture) screenCanvas.texture.needsUpdate = true;
  // }, [panelData]);

  useEffect(() => {
    if (!panelData || Object.keys(panelData).length === 0) return;
    if (!screenCanvasRef.current || !screenTextureRef.current) return;

    const value = panelData.Ptot ?? "0";
    const title = "Total Power";
    const unit = "kW";

    document.getElementById("pm-value").textContent = String(value);
  }, [panelData]);

  // host container: w-full, height can be controlled by parent. default minHeight
  return (
    <div
      ref={hostRef}
      style={{
        position: "relative",
        width: "100%",
        height: "300px",
        minHeight: "360px",
        overflow: "hidden",
        borderRadius: "12px",
      }}
    />
  );
}
