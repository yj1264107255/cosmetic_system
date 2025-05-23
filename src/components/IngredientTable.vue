<template>
  <div class="ingredient-table">
    <div class="table-header">
      <div class="column name-column">成分名称</div>
      <div class="column score-column">功效分</div>
      <div class="column safety-column">活性成分</div>
      <div class="column usage-column">使用目的</div>
    </div>
    
    <div v-for="(ingredient, index) in ingredients" :key="index" class="table-row">
      <div class="column name-column">{{ ingredient.name }}</div>
      <div class="column score-column">
        <span v-if="ingredient.score" class="score">{{ ingredient.score }}</span>
        <span v-else>-</span>
      </div>
      <div class="column safety-column">
        <div v-if="ingredient.isActive" class="active-mark">
          <van-icon name="checked" color="#ff6b81" />
        </div>
        <div v-else>-</div>
      </div>
      <div class="column usage-column">{{ ingredient.usage || '-' }}</div>
    </div>
    
    <div class="legend">
      <div class="legend-item">
        <span class="dot high"></span>
        <span>高活性</span>
      </div>
      <div class="legend-item">
        <span class="dot medium"></span>
        <span>中活性</span>
      </div>
      <div class="legend-item">
        <span class="dot low"></span>
        <span>低活性</span>
      </div>
      <div class="legend-item">
        <span class="dot none"></span>
        <span>无活性</span>
      </div>
    </div>

    <div class="function-summary">
      <div class="function-row">
        <span>保湿：17</span>
        <span>抗氧化：14</span>
        <span>皮肤调理：4</span>
        <span>舒缓：4</span>
      </div>
      <div class="function-row">
        <span>抗衰：3</span>
        <span>舒缓：2</span>
        <span>祛屑：1</span>
        <span>抗氧化：1</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  ingredients: {
    type: Array,
    default: () => []
  }
});
</script>

<style scoped>
.ingredient-table {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  padding: 10px 0;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  color: #333;
  font-size: 14px;
}

.table-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}

.column {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-column {
  flex: 2;
  color: #333;
}

.score-column {
  flex: 1;
  text-align: center;
}

.safety-column {
  flex: 1;
  text-align: center;
}

.usage-column {
  flex: 1;
  color: #666;
  text-align: center;
}

.score {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  color: white;
  border-radius: 50%;
  background-color: #ff6b81;
  font-size: 12px;
}

.active-mark {
  display: flex;
  justify-content: center;
  align-items: center;
}

.legend {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}

.high {
  background-color: #ff4d4f;
}

.medium {
  background-color: #ff7a45;
}

.low {
  background-color: #ffbb96;
}

.none {
  background-color: #d9d9d9;
}

.function-summary {
  margin-top: 16px;
  font-size: 12px;
  color: #666;
}

.function-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.function-row:last-child {
  margin-bottom: 0;
}
</style> 