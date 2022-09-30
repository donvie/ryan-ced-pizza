<template>
  <div class="q-mt-sm">
    <q-card>
      <q-card-section class="text-h5">
        Dashboard
      </q-card-section>

      <q-card-section class="row">
        <div class="col-12 q-mb-md">
          <q-item>
            <q-item-section avatar>
              <q-icon name="fas fa-calendar-day" color="primary" size="44px"></q-icon>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6">Today</q-item-label>
              <q-item-label>{{$global.sales.today}}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <div class="col-12 q-mb-md">
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="fas fa-chart-column" size="44px"/>
            </q-item-section>

            <q-item-section>
              <div class="text-h6">By Day</div>
            </q-item-section>
          </q-item>
          <div>
            <line-chart height="230px" :data="$global.sales.byDay"></line-chart>
          </div>
        </div>
        <div class="col-12 q-mb-md">
          <q-item>
            <q-item-section avatar>
              <q-icon color="primary" name="fas fa-chart-line" size="44px"/>
            </q-item-section>

            <q-item-section>
              <div class="text-h6">By Month</div>
            </q-item-section>
          </q-item>
          <div>
            <line-chart height="230px" :data="$global.sales.byMonth"></line-chart>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
</script>

<style scoped></style>
