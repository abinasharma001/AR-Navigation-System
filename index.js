/**
 * MSCB University 360 Campus Tour
 * Beautified & Mobile-Optimized Version
 * Powered by Marzipano
 */

'use strict';

(function() {
  // Dependencies
  const Marzipano = window.Marzipano;
  const bowser = window.bowser;
  const screenfull = window.screenfull;
  const data = window.APP_DATA;

  // DOM Elements
  const elements = {
    pano: document.querySelector('#pano'),
    sceneName: document.querySelector('#titleBar .sceneName'),
    sceneList: document.querySelector('#sceneList'),
    scenes: null, // Will be populated after scene list is generated
    sceneListToggle: document.querySelector('#sceneListToggle'),
    autorotateToggle: document.querySelector('#autorotateToggle'),
    fullscreenToggle: document.querySelector('#fullscreenToggle'),
    viewControls: {
      up: document.querySelector('#viewUp'),
      down: document.querySelector('#viewDown'),
      left: document.querySelector('#viewLeft'),
      right: document.querySelector('#viewRight'),
      in: document.querySelector('#viewIn'),
      out: document.querySelector('#viewOut')
    }
  };

  // ============================================
  // DEVICE DETECTION
  // ============================================
  
  function detectDevice() {
    if (window.matchMedia) {
      const setMode = () => {
        const isMobile = mql.matches;
        document.body.classList.toggle('mobile', isMobile);
        document.body.classList.toggle('desktop', !isMobile);
      };
      
      const mql = matchMedia("(max-width: 768px), (max-height: 500px)");
      setMode();
      mql.addListener(setMode);
    } else {
      document.body.classList.add('desktop');
    }
  }

  function detectTouch() {
    document.body.classList.add('no-touch');
    window.addEventListener('touchstart', function() {
      document.body.classList.remove('no-touch');
      document.body.classList.add('touch');
    }, { once: true });
  }

  // Tooltip fallback for IE < 11
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // ============================================
  // MARZIPANO VIEWER INITIALIZATION
  // ============================================
  
  const viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  const viewer = new Marzipano.Viewer(elements.pano, viewerOpts);

  // ============================================
  // SCENE CREATION
  // ============================================
  
  const scenes = data.scenes.map(sceneData => {
    const urlPrefix = "tiles";
    
    // Create image source
    const source = Marzipano.ImageUrlSource.fromString(
      `${urlPrefix}/${sceneData.id}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: `${urlPrefix}/${sceneData.id}/preview.jpg` }
    );
    
    // Create geometry
    const geometry = new Marzipano.CubeGeometry(sceneData.levels);
    
    // Create view with limits
    const limiter = Marzipano.RectilinearView.limit.traditional(
      sceneData.faceSize, 
      100 * Math.PI / 180, 
      120 * Math.PI / 180
    );
    const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);
    
    // Create scene
    const scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });
    
    // Add link hotspots
    sceneData.linkHotspots.forEach(hotspot => {
      const element = createLinkHotspot(hotspot);
      scene.hotspotContainer().createHotspot(element, { 
        yaw: hotspot.yaw, 
        pitch: hotspot.pitch 
      });
    });
    
    // Add info hotspots
    sceneData.infoHotspots.forEach(hotspot => {
      const element = createInfoHotspot(hotspot);
      scene.hotspotContainer().createHotspot(element, { 
        yaw: hotspot.yaw, 
        pitch: hotspot.pitch 
      });
    });
    
    return {
      data: sceneData,
      scene: scene,
      view: view
    };
  });

  // ============================================
  // AUTO-ROTATE SETUP
  // ============================================
  
  const autorotate = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI / 2
  });

  if (data.settings.autorotateEnabled) {
    elements.autorotateToggle.classList.add('enabled');
  }

  function startAutorotate() {
    if (!elements.autorotateToggle.classList.contains('enabled')) return;
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    elements.autorotateToggle.classList.toggle('enabled');
    
    if (elements.autorotateToggle.classList.contains('enabled')) {
      startAutorotate();
    } else {
      stopAutorotate();
    }
  }

  // ============================================
  // FULLSCREEN SETUP
  // ============================================
  
  if (screenfull.isEnabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    
    elements.fullscreenToggle.addEventListener('click', () => {
      screenfull.toggle();
    });
    
    screenfull.on('change', () => {
      elements.fullscreenToggle.classList.toggle('enabled', screenfull.isFullscreen);
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // ============================================
  // SCENE LIST MANAGEMENT
  // ============================================
  
  function showSceneList() {
    elements.sceneList.classList.add('enabled');
    elements.sceneListToggle.classList.add('enabled');
  }

  function hideSceneList() {
    elements.sceneList.classList.remove('enabled');
    elements.sceneListToggle.classList.remove('enabled');
  }

  function toggleSceneList() {
    elements.sceneList.classList.toggle('enabled');
    elements.sceneListToggle.classList.toggle('enabled');
  }

  // ============================================
  // SCENE SWITCHING
  // ============================================
  
  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    updateSceneList(scene);
  }

  function updateSceneName(scene) {
    elements.sceneName.textContent = scene.data.name;
  }

  function updateSceneList(scene) {
    if (!elements.scenes) return;
    
    elements.scenes.forEach(el => {
      const isActive = el.getAttribute('data-id') === scene.data.id;
      el.classList.toggle('current', isActive);
    });
  }

  function findSceneById(id) {
    return scenes.find(s => s.data.id === id) || null;
  }

  function findSceneDataById(id) {
    return data.scenes.find(s => s.id === id) || null;
  }

  // ============================================
  // VIEW CONTROLS
  // ============================================
  
  const velocity = 0.7;
  const friction = 3;
  const controls = viewer.controls();

  controls.registerMethod('upElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.up, 'y', -velocity, friction), true);
  controls.registerMethod('downElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.down, 'y', velocity, friction), true);
  controls.registerMethod('leftElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.left, 'x', -velocity, friction), true);
  controls.registerMethod('rightElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.right, 'x', velocity, friction), true);
  controls.registerMethod('inElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.in, 'zoom', -velocity, friction), true);
  controls.registerMethod('outElement', 
    new Marzipano.ElementPressControlMethod(elements.viewControls.out, 'zoom', velocity, friction), true);

  // ============================================
  // HOTSPOT CREATION
  // ============================================
  
  function createLinkHotspot(hotspot) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot', 'link-hotspot');
    
    const icon = document.createElement('img');
    icon.src = 'img/link.png';
    icon.classList.add('link-hotspot-icon');
    
    // Apply rotation
    const rotation = `rotate(${hotspot.rotation}rad)`;
    icon.style.transform = rotation;
    icon.style.webkitTransform = rotation;
    icon.style.msTransform = rotation;
    
    // Click handler
    wrapper.addEventListener('click', () => {
      const targetScene = findSceneById(hotspot.target);
      if (targetScene) switchScene(targetScene);
    });
    
    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip', 'link-hotspot-tooltip');
    const targetData = findSceneDataById(hotspot.target);
    tooltip.textContent = targetData ? targetData.name : '';
    
    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);
    
    preventEventPropagation(wrapper);
    
    return wrapper;
  }

  function createInfoHotspot(hotspot) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('hotspot', 'info-hotspot');
    
    // Header
    const header = document.createElement('div');
    header.classList.add('info-hotspot-header');
    
    // Icon
    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    const icon = document.createElement('img');
    icon.src = 'img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);
    
    // Title
    const titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    const title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.textContent = hotspot.title;
    titleWrapper.appendChild(title);
    
    // Close button
    const closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    const closeIcon = document.createElement('img');
    closeIcon.src = 'img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);
    
    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);
    
    // Text content
    const text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;
    
    wrapper.appendChild(header);
    wrapper.appendChild(text);
    
    // Mobile modal
    const modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);
    
    const toggle = () => {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };
    
    header.addEventListener('click', toggle);
    modal.querySelector('.info-hotspot-close-wrapper')?.addEventListener('click', toggle);
    
    preventEventPropagation(wrapper);
    
    return wrapper;
  }

  function preventEventPropagation(element) {
    const events = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel'];
    events.forEach(eventName => {
      element.addEventListener(eventName, e => e.stopPropagation());
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  
  elements.sceneListToggle.addEventListener('click', toggleSceneList);
  elements.autorotateToggle.addEventListener('click', toggleAutorotate);

  // Scene selection
  scenes.forEach(scene => {
    const el = document.querySelector(`#sceneList .scene[data-id="${scene.data.id}"]`);
    if (!el) return;
    
    el.addEventListener('click', () => {
      switchScene(scene);
      
      // Auto-hide scene list on mobile
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // ============================================
  // POPULATE SCENE LIST
  // ============================================
  
  function getSceneEmoji(sceneName) {
    const name = sceneName.toLowerCase();
    
    // Map scene names to emojis
    if (name.includes('welcome') || name.includes('tour')) return '🏛️';
    if (name.includes('gate') || name.includes('entry')) return '🚪';
    if (name.includes('enter')) return '👣';
    if (name.includes('way') || name.includes('path')) return '🛤️';
    if (name.includes('love')) return '❤️';
    if (name.includes('convention')) return '🎭';
    if (name.includes('canteen')) return '☕';
    if (name.includes('computer') || name.includes('center')) return '💻';
    if (name.includes('academic') || name.includes('block')) return '📚';
    if (name.includes('admin')) return '🏛️';
    if (name.includes('bank')) return '🏦';
    if (name.includes('bio')) return '🧬';
    if (name.includes('exam')) return '📝';
    if (name.includes('gym')) return '💪';
    if (name.includes('post')) return '📮';
    if (name.includes('library')) return '📖';
    if (name.includes('mca')) return '🎓';
    if (name.includes('square')) return '🏫';
    if (name.includes('statue')) return '🗿';
    
    return '📍'; // Default emoji
  }
  
  function populateSceneList() {
    const sceneListContainer = document.querySelector('#sceneList .scenes');
    sceneListContainer.innerHTML = ''; // Clear existing content
    
    scenes.forEach((scene, index) => {
      const sceneLink = document.createElement('a');
      sceneLink.href = 'javascript:void(0)';
      sceneLink.className = 'scene';
      sceneLink.setAttribute('data-id', scene.data.id);
      
      const sceneText = document.createElement('li');
      sceneText.className = 'text';
      
      // Add emoji based on scene name
      const emoji = getSceneEmoji(scene.data.name);
      sceneText.textContent = `${emoji} ${scene.data.name}`;
      
      sceneLink.appendChild(sceneText);
      sceneListContainer.appendChild(sceneLink);
      
      // Add click handler
      sceneLink.addEventListener('click', () => {
        switchScene(scene);
        
        // Auto-hide scene list on mobile
        if (document.body.classList.contains('mobile')) {
          hideSceneList();
        }
      });
    });
    
    // Update elements reference after populating
    elements.scenes = document.querySelectorAll('#sceneList .scene');
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  detectDevice();
  detectTouch();
  
  // Populate the scene list with data
  populateSceneList();

  // Open scene list on desktop by default
  if (!document.body.classList.contains('mobile')) {
    showSceneList();
  }

  // Display initial scene
  if (scenes.length > 0) {
    switchScene(scenes[0]);
  }

})();