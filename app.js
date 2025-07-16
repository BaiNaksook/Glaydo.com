 const DEFAULT_COORDS = [13.15024, 99.95724];
    const DEFAULT_ZOOM = 15;

    const map = L.map('map').setView(DEFAULT_COORDS, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const centerMarker = L.marker(DEFAULT_COORDS, {
      icon: L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      }),
      title: "โรงเรียนพัฒนศาสนวิทยาท่าแร้ง",
      riseOnHover: true,
    }).addTo(map);

    centerMarker.bindPopup("ตำแหน่งของคุณปัจจุบันอยู่ตรงนี้<br><strong>โรงเรียนพัฒนศาสนวิทยาท่าแร้ง</strong>").openPopup();

    const locationInput = document.getElementById('location');
    const capsuleList = document.getElementById('capsuleList');
    const capsuleForm = document.getElementById('capsuleForm');
    const cutsceneOverlay = document.getElementById('cutsceneOverlay');

    const confirmModal = document.getElementById('confirmModal');
    const btnCancel = document.getElementById('btnCancel');
    const btnConfirm = document.getElementById('btnConfirm');
    let deleteIndex = null;

    let currentLatLng = { lat: DEFAULT_COORDS[0], lng: DEFAULT_COORDS[1] };
    let markers = [];

    map.on('click', e => {
      currentLatLng = e.latlng;
      locationInput.value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    });

    function loadCapsules() {
      capsuleList.innerHTML = '';
      markers.forEach(m => map.removeLayer(m));
      markers = [];
      let data = JSON.parse(localStorage.getItem('capsules') || '[]');
      data.forEach((c, i) => {
        const li = document.createElement('li');
        li.className = 'capsule-item';
        li.innerHTML = `
          <div>
            <strong>พิกัด:</strong> ${c.latlng}<br />
            <strong>ความทรงจำ:</strong> ${c.memory}
          </div>
          <button aria-label="ลบแคปซูลที่ ${i + 1}" data-index="${i}">ลบ</button>
        `;
        capsuleList.appendChild(li);

        li.querySelector('button').addEventListener('click', () => {
          deleteIndex = i;
          showConfirmModal();
        });

        let latlngParts = c.latlng.split(',').map(s => parseFloat(s.trim()));
        if (latlngParts.length === 2 && !isNaN(latlngParts[0]) && !isNaN(latlngParts[1])) {
          let m = L.marker(latlngParts).addTo(map);
          m.bindPopup(`<b>ความทรงจำ:</b><br>${c.memory}`).openPopup();
          markers.push(m);
        }
      });
    }

    function deleteCapsule(index) {
      let data = JSON.parse(localStorage.getItem('capsules') || '[]');
      if (index !== null && index >= 0 && index < data.length) {
        data.splice(index, 1);
        localStorage.setItem('capsules', JSON.stringify(data));
        loadCapsules();
      }
    }

    function showConfirmModal() {
      confirmModal.classList.add('show');
      confirmModal.focus();
    }

    function hideConfirmModal() {
      confirmModal.classList.remove('show');
      deleteIndex = null;
    }

    btnCancel.addEventListener('click', () => {
      hideConfirmModal();
    });
    btnConfirm.addEventListener('click', () => {
      if (deleteIndex !== null) {
        deleteCapsule(deleteIndex);
      }
      hideConfirmModal();
    });

    capsuleForm.addEventListener('submit', e => {
      e.preventDefault();
      const memoryText = document.getElementById('memory').value.trim();
      if (!memoryText) {
        alert('กรุณากรอกความทรงจำก่อนฝังแคปซูล');
        return;
      }
      cutsceneOverlay.classList.add('show');
      setTimeout(() => {
        cutsceneOverlay.classList.remove('show');
        let data = JSON.parse(localStorage.getItem('capsules') || '[]');
        data.push({
          latlng: `${currentLatLng.lat.toFixed(5)}, ${currentLatLng.lng.toFixed(5)}`,
          memory: memoryText
        });
        localStorage.setItem('capsules', JSON.stringify(data));
        loadCapsules();
        document.getElementById('memory').value = '';
      }, 3500);
    });

    loadCapsules();

    // ChatGPT Widget Logic
    const chatWidget = document.getElementById('chatWidget');
    const chatHeader = document.getElementById('chatHeader');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatBody = document.getElementById('chatBody');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatToggleBtnContainer = document.getElementById('chatToggleBtnContainer');
    const chatToggleBtn = document.getElementById('chatToggleBtn');

    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    chatHeader.addEventListener('mousedown', e => {
      isDragging = true;
      dragOffsetX = e.clientX - chatWidget.offsetLeft;
      dragOffsetY = e.clientY - chatWidget.offsetTop;
      chatWidget.style.transition = 'none';
      chatWidget.style.userSelect = 'none';
      e.preventDefault();
    });
    document.addEventListener('mouseup', e => {
      isDragging = false;
      chatWidget.style.transition = 'box-shadow 0.3s ease';
      chatWidget.style.userSelect = 'auto';
    });
    document.addEventListener('mousemove', e => {
      if (!isDragging) return;
      let x = e.clientX - dragOffsetX;
      let y = e.clientY - dragOffsetY;
      const maxX = window.innerWidth - chatWidget.offsetWidth - 20;
      const maxY = window.innerHeight - chatWidget.offsetHeight - 20;
      x = Math.min(Math.max(20, x), maxX);
      y = Math.min(Math.max(20, y), maxY);
      chatWidget.style.left = x + 'px';
      chatWidget.style.top = y + 'px';
      chatWidget.style.right = 'auto';
      chatWidget.style.bottom = 'auto';
    });

    chatCloseBtn.addEventListener('click', () => {
      chatWidget.style.display = 'none';
      chatToggleBtnContainer.style.display = 'block';
    });

    chatToggleBtn.addEventListener('click', () => {
      chatWidget.style.display = 'flex';
      chatToggleBtnContainer.style.display = 'none';
    });

    function botReply(message) {
      const msg = message.toLowerCase().trim();
      if (msg.includes('วิธีใช้') || msg.includes('ช่วย') || msg.includes('ทำยังไง')) {
        return `👋 สวัสดี! คุณสามารถคลิกบนแผนที่เพื่อเลือกพิกัด จากนั้นกรอกความทรงจำของคุณแล้วกด "ฝังแคปซูล" เพื่อบันทึกความทรงจำไว้บนแผนที่ได้เลยครับ`;
      }
      if (msg.includes('ลบ') || msg.includes('ลบแคปซูล')) {
        return `เมื่อต้องการลบแคปซูล ให้กดปุ่ม "ลบ" ในรายการแคปซูล แล้วจะมีหน้าต่างยืนยันก่อนลบ เพื่อป้องกันการลบโดยไม่ตั้งใจครับ`;
      }
      if (msg.includes('แผนที่') || msg.includes('พิกัด') || msg.includes('ตำแหน่ง')) {
        return `แผนที่นี้ตั้งที่ตำบลท่าแร้ง อำเภอบ้านแหลม จังหวัดเพชรบุรี โดยมีโรงเรียนพัฒนศาสนวิทยาท่าแร้งเป็นจุดศูนย์กลางครับ`;
      }
      if (msg.includes('สวัสดี') || msg.includes('hello')) {
        return `สวัสดีครับ! ยินดีช่วยเหลือคุณเสมอ 😊`;
      }
      if (msg.includes('ชื่อ') || msg.includes('ใคร')) {
        return `ผมคือ ChatGPT ผู้ช่วยแชทในแอป Memory Capsule XR ครับ`;
      }
      if (msg.includes('ช่วยแนะนำ') || msg.includes('แนะนำ')) {
        return `แนะนำให้ลองฝังความทรงจำที่สำคัญๆ แล้วกลับมาเปิดดูในอนาคตครับ นี่เป็นวิธีที่ดีในการเก็บเรื่องราวและความรู้สึกครับ`;
      }
      if (msg.length === 0) {
        return `กรุณาพิมพ์ข้อความก่อนส่งนะครับ`;
      }
      return `ขอโทษครับ ผมยังไม่เข้าใจคำถามนี้ ลองถามเกี่ยวกับวิธีใช้แอป หรือเรื่องที่เกี่ยวข้องนะครับ 😉`;
    }

    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const userText = chatInput.value.trim();
      if (!userText) return;
      appendMessage(userText, 'right');
      chatInput.value = '';
      setTimeout(() => {
        appendMessage(botReply(userText), 'left');
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 700);
    });

    function appendMessage(text, side) {
      const msgDiv = document.createElement('div');
      msgDiv.className = side === 'right' ? 'text-right' : 'text-left';
      const span = document.createElement('span');
      span.textContent = text;
      msgDiv.appendChild(span);
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Loading Screen Logic
    const loadingScreen = document.getElementById('loadingScreen');
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 2300);
      
    });

    
    // ==== 🎨 ระบบโปรไฟล์ ====

function openProfileEditor() {
  document.getElementById('profileModal').classList.remove('hidden');
}

function closeProfileEditor() {
  document.getElementById('profileModal').classList.add('hidden');
}

function saveProfile() {
  const profile = {
    name: document.getElementById('profileName').value.trim() || 'ไม่ระบุชื่อ',
    bio: document.getElementById('profileBio').value.trim() || 'ยังไม่มีคำบรรยาย',
    theme: document.getElementById('profileTheme').value || 'indigo',
    picture: document.getElementById('profilePic').value.trim() || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    music: document.getElementById('profileMusic').value.trim() || ''
  };
  localStorage.setItem('userProfile', JSON.stringify(profile));
  closeProfileEditor();
  loadProfileDisplay();
}

function loadProfileDisplay() {
  const data = JSON.parse(localStorage.getItem('userProfile') || '{}');

  document.getElementById('profileNameDisplay').textContent = data.name || 'ไม่ระบุชื่อ';
  document.getElementById('profileBioDisplay').textContent = data.bio || 'ยังไม่มีคำบรรยาย';
  document.getElementById('profilePictureDisplay').src = data.picture || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // เปลี่ยนธีมสี
  const themeColor = themeToColor(data.theme || 'indigo');
  document.body.className = `min-h-screen flex flex-col items-center px-6 py-12 select-none bg-${themeColor}-900`;

  // เล่นเพลงพื้นหลัง
  if (data.music && !document.getElementById('bgMusic')) {
    const audio = document.createElement('audio');
    audio.id = 'bgMusic';
    audio.src = data.music;
    audio.autoplay = true;
    audio.loop = true;
    audio.volume = 0.3;
    document.body.appendChild(audio);
  }
}

function themeToColor(theme) {
  switch (theme) {
    case 'blue': return 'blue';
    case 'pink': return 'pink';
    default: return 'indigo';
  }
}

// โหลดโปรไฟล์ทันทีตอนเริ่ม
window.addEventListener('load', () => {
  loadProfileDisplay();
});
