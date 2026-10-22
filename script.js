document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ヘッダー画像の変更処理（imgタグ対応） ---
  const inputImage = document.getElementById('input-image');
  const headerImg = document.getElementById('card-header-img');

  if (inputImage && headerImg) {
    inputImage.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          headerImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- 2. カードを画像で保存する機能 ---
  const saveBtn = document.getElementById('save-btn'); 
  const previewCard = document.getElementById('profile-card'); 

  if (saveBtn && previewCard) {
    saveBtn.addEventListener('click', () => {
      const headerImg = document.getElementById('card-header-img');
      const isEmptyImg = !headerImg || !headerImg.getAttribute('src');

      // 画像が未選択のときは一時的に非表示にしてエラーを回避
      if (isEmptyImg && headerImg) {
        headerImg.style.display = 'none';
      }

      html2canvas(previewCard, { useCORS: true, scale: 3 }).then(canvas => {
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