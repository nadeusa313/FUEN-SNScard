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

// ヘッダー画像の変更処理（自動で中央トリミングして保存時の圧縮を防ぐ）
// ヘッダー画像の変更処理（実際の表示サイズに完全に比例させて切り抜く）
const inputImage = document.getElementById('input-image');
const headerImg = document.getElementById('card-header-img');

if (inputImage && headerImg) {
  inputImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // 画面上のヘッダー表示比率（幅460px : 高さ420px）の「2倍高画質サイズ」に設定
        const targetWidth = 920;
        const targetHeight = 840;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        // 正確な比率計算
        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        // 元画像から「切り抜く範囲（source）」を決定する（歪みを絶対に出さない計算）
        if (imgAspect > targetAspect) {
          // 画像が横長の場合：左右をカット
          sourceWidth = img.height * targetAspect;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // 画像が縦長の場合：上下をカット
          sourceHeight = img.width / targetAspect;
          sourceY = (img.height - sourceHeight) / 2;
        }

        // 元画像の central 部分だけを切り抜いて targetCanvas に描画
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // 切り抜き元（元画像）
          0, 0, targetWidth, targetHeight              // 描画先（Canvas）
        );

        // トリミング済みの画像データをセット
        headerImg.src = canvas.toDataURL('image/jpeg', 0.92);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- カードを画像で保存する機能 ---
  const saveBtn = document.getElementById('save-btn'); 
  const previewCard = document.getElementById('profile-card'); 

  if (saveBtn && previewCard) {
    saveBtn.addEventListener('click', () => {
      const headerImg = document.getElementById('card-header-img');
      const isEmptyImg = !headerImg || !headerImg.getAttribute('src');

      if (isEmptyImg && headerImg) {
        headerImg.style.display = 'none';
      }

      // scale を 2 に変更してスマホの画像描画歪みを防ぐ
      html2canvas(previewCard, { 
        useCORS: true, 
        scale: 2,
        logging: false
      }).then(canvas => {
        if (isEmptyImg && headerImg) {
          headerImg.style.display = '';
        }

        const link = document.createElement('a');
        link.download = 'character-card.png'; 
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        if (isEmptyImg && headerImg) {
          headerImg.style.display = '';
        }
        console.error('画像の保存に失敗しました:', err);
        alert('画像の保存に失敗しました。');
      });
    });
  }
});