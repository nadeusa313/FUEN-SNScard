document.addEventListener('DOMContentLoaded', () => {

  // --- 1. テキスト入力の連動 ---
  const inputName = document.getElementById('input-name');
  const previewName = document.getElementById('preview-name');
  if (inputName && previewName) {
    inputName.addEventListener('input', () => {
      previewName.textContent = inputName.value.trim() !== '' ? inputName.value : 'キャラクター名';
    });
  }

  const inputGameId = document.getElementById('input-game-id');
  const previewGameId = document.getElementById('preview-game-id');
  if (inputGameId && previewGameId) {
    inputGameId.addEventListener('input', () => {
      previewGameId.textContent = inputGameId.value.trim() !== '' ? `ID: ${inputGameId.value}` : 'ID: ---';
    });
  }

// --- メッセージの連動（未入力時はセクションごと非表示） ---
  const inputMessage = document.getElementById('input-message');
  const previewMessage = document.getElementById('preview-message');
  const messageSection = previewMessage ? previewMessage.closest('.message-section') : null;

  if (inputMessage && previewMessage) {
    inputMessage.addEventListener('input', () => {
      const val = inputMessage.value.trim();
      
      if (val !== '') {
        previewMessage.textContent = val;
        if (messageSection) messageSection.style.display = ''; // 入力があるときは表示
      } else {
        previewMessage.textContent = '';
        if (messageSection) {
          messageSection.style.display = 'none'; // 💡 入力がないときは見出しごと非表示
        }
      }
    });

    // ページを開いた初期状態（空のとき）にも隠しておく
    if (inputMessage.value.trim() === '' && messageSection) {
      messageSection.style.display = 'none';
    }
  }

  // --- 2. 単一選択タグ（年齢・性別など 1つだけ選ぶ項目） ---
  function setupSingleSelect(groupId, previewId) {
    const group = document.getElementById(groupId);
    const preview = document.getElementById(previewId);
    if (!group) return;

    const buttons = group.querySelectorAll('.tag-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (preview) {
          const val = btn.getAttribute('data-value');
          
          if ((groupId === 'age-group' || groupId === 'gender-group') && val === '非公開') {
            preview.style.display = 'none';
          } else {
            preview.textContent = val;
            preview.style.display = ''; 
          }
        }
      });
    });
  }

  setupSingleSelect('age-group', 'preview-age');
  setupSingleSelect('gender-group', 'preview-gender');

  // --- 3. 複数選択タグ（流派・流儀・募集・武器など 複数選べる項目） ---
  function setupMultiSelect(groupIds, previewContainerId, badgeClass = 'card-tag') {
    const previewContainer = document.getElementById(previewContainerId);
    
    const groupArray = Array.isArray(groupIds) ? groupIds : [groupIds];
    
    const updatePreview = () => {
      if (!previewContainer) return;
      previewContainer.innerHTML = '';

      groupArray.forEach(groupId => {
        const group = document.getElementById(groupId);
        if (!group) return;

        const activeBtns = group.querySelectorAll('.tag-btn.active');
        activeBtns.forEach(btn => {
          const val = btn.getAttribute('data-value');
          const span = document.createElement('span');
          span.className = badgeClass;
          span.textContent = val;
          span.setAttribute('data-value', val);
          previewContainer.appendChild(span);
        });
      });
    };

    groupArray.forEach(groupId => {
      const group = document.getElementById(groupId);
      if (!group) return;

      const buttons = group.querySelectorAll('.tag-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active'); 
          updatePreview();               
        });
      });
    });

    updatePreview();
  }

  // 複数選択の適用
  setupMultiSelect('sect-group', 'preview-sect-container', 'sect-badge');
  setupMultiSelect('ryugi-group', 'preview-ryugi-container', 'ryugi-badge');
  setupMultiSelect(['recruitment-group', 'recruitment-group2'], 'preview-recruitment-container', 'recruitment-tag');
  setupMultiSelect('platform-group', 'preview-platform-container');
  setupMultiSelect('favorite-group', 'preview-favorite-container');
  setupMultiSelect('weapon-group', 'preview-weapon-container');
  setupMultiSelect('tendency-group', 'preview-tendency-container'); // 重複を1つに整理しました

  // プレイ時間帯の専用関数をここで呼ぶ
  setupPlaytimeMatrix();

  // --- プレイ時間帯専用の連動処理（カプセル表用・複数選択対応） ---
  function setupPlaytimeMatrix() {
    const group = document.getElementById('playtime-group');
    if (!group) return;

    const buttons = group.querySelectorAll('.tag-btn');
    const cardBtns = document.querySelectorAll('.card-time-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('active');

        const activeValues = Array.from(group.querySelectorAll('.tag-btn.active'))
                                  .map(b => b.getAttribute('data-value'));

        cardBtns.forEach(cardBtn => {
          const val = cardBtn.getAttribute('data-time');
          if (activeValues.includes(val)) {
            cardBtn.classList.add('active');
          } else {
            cardBtn.classList.remove('active');
          }
        });
      });
    });
  }

  // --- 4. ヘッダー画像の変更 ---
  const inputImage = document.getElementById('input-image');
  const cardHeaderBg = document.getElementById('card-header-bg');

  if (inputImage && cardHeaderBg) {
    inputImage.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          cardHeaderBg.style.backgroundImage = `url(${event.target.result})`;
          cardHeaderBg.style.backgroundSize = 'cover';
          cardHeaderBg.style.backgroundPosition = 'center';
        };
        reader.readAsDataURL(file);
      }
    });
  }

// --- 5. カードを画像で保存する機能 ---
  const saveBtn = document.getElementById('save-btn'); 
  const previewCard = document.getElementById('profile-card'); 

  if (saveBtn && previewCard) {
    saveBtn.addEventListener('click', () => {
      // 画面の見た目のバランスのまま、高画質（2倍または3倍）で保存する
      html2canvas(previewCard, { useCORS: true, scale: 5 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'character-card.png'; 
        link.href = canvas.toDataURL('image/png'); // そのまま出力
        link.click();
      }).catch(err => {
        console.error('画像の保存に失敗しました:', err);
      });
    });
  }
});
