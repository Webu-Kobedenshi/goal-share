<script setup lang="ts">
import { ref } from 'vue'

const selectedOption = ref<'create' | 'join' | null>(null)

const handleCreateGroup = () => {
  selectedOption.value = 'create'
}

const handleJoinGroup = () => {
  selectedOption.value = 'join'
}

const handleBack = () => {
  selectedOption.value = null
}
</script>

<template>
  <div class="page-container">
    <!-- 初期選択画面 -->
    <template v-if="selectedOption === null">
      <header class="fork-header">
        <h1>グループを選択してください</h1>
        <p class="subtitle">グループを新規作成するか、既存グループに参加申請してください</p>
      </header>

      <section class="options-section">
        <div class="options-container">
          <button class="option-card" @click="handleCreateGroup">
            <div class="option-icon">➕</div>
            <h2>グループを作成</h2>
            <p>新しいグループを作成します</p>
          </button>

          <button class="option-card" @click="handleJoinGroup">
            <div class="option-icon">🤝</div>
            <h2>グループに参加</h2>
            <p>既存グループに参加申請します</p>
          </button>
        </div>
      </section>
    </template>

    <!-- グループ作成画面 -->
    <template v-if="selectedOption === 'create'">
      <header class="action-header">
        <button class="back-button" @click="handleBack">← 戻る</button>
        <h1>グループを作成</h1>
      </header>

      <section class="form-section">
        <div class="form-container">
          <div class="form-group">
            <label for="group-name">グループ名</label>
            <input
              id="group-name"
              type="text"
              placeholder="グループ名を入力してください"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="group-description">説明</label>
            <textarea
              id="group-description"
              placeholder="グループの説明を入力してください（オプション）"
              class="textarea-field"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="handleBack">キャンセル</button>
            <button class="submit-btn">作成</button>
          </div>
        </div>
      </section>
    </template>

    <!-- グループ参加申請画面 -->
    <template v-if="selectedOption === 'join'">
      <header class="action-header">
        <button class="back-button" @click="handleBack">← 戻る</button>
        <h1>グループに参加</h1>
      </header>

      <section class="form-section">
        <div class="form-container">
          <div class="form-group">
            <label for="group-code">グループコード</label>
            <input
              id="group-code"
              type="text"
              placeholder="参加するグループのコードを入力してください"
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label for="join-message">参加メッセージ</label>
            <textarea
              id="join-message"
              placeholder="参加理由や自己紹介を入力してください（オプション）"
              class="textarea-field"
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="handleBack">キャンセル</button>
            <button class="submit-btn">申請</button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
}

/* ===== ヘッダー ===== */
.fork-header {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  padding: 40px 32px;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  text-align: center;
}

.fork-header h1 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: #cbd5e1;
  font-weight: 400;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.back-button {
  background-color: #e2e8f0;
  color: #1e293b;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #cbd5e1;
  transform: translateX(-4px);
}

.action-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  flex: 1;
}

/* ===== オプション選択セクション ===== */
.options-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

.options-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.option-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.option-card:hover {
  border-color: #0f172a;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.option-icon {
  font-size: 3rem;
  line-height: 1;
}

.option-card h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
}

.option-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 400;
}

/* ===== フォームセクション ===== */
.form-section {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.input-field,
.textarea-field {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  color: #1e293b;
  transition: all 0.2s ease;
}

.input-field:focus,
.textarea-field:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.textarea-field {
  resize: vertical;
}

/* ===== フォームアクション ===== */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #1e293b;
}

.cancel-btn:hover {
  background-color: #cbd5e1;
}

.submit-btn {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.3);
}

/* ===== レスポンシブ ===== */
@media (max-width: 768px) {
  .page-container {
    padding: 24px 16px;
  }

  .fork-header {
    padding: 32px 24px;
  }

  .fork-header h1 {
    font-size: 1.5rem;
  }

  .action-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-header h1 {
    font-size: 1.5rem;
  }

  .options-container {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
