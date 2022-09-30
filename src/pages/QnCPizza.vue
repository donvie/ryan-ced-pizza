<style>
  .my-card {
    width: 100%;
    max-width: 350px
  }
  .custom-caption {
    text-align: left;
    padding: 12px;
    color: white;
    background-color: rgba(0, 0, 0, .5);
  }
</style>
<template>
  <div class="q-pa-md row justify-center q-gutter-md" >
    <q-card class="my-card" v-for="(i, ind) in $global.items" :key="'item' + i.id">
      <q-carousel
        arrows
        animated
        infinite
        swipeable
        v-model="i.imgModel"
        :autoplay="6000 + (ind * 1500)"
        height="180px"
      >
        <q-carousel-slide v-for="img in i.images" :key="`${i.id}-${img.id}`" :name="`${i.id}-${img.id}`" :img-src="$api.defaults.baseURL.replace('/api', '') + img.url" loading="lazy" >
          <div class="absolute-bottom custom-caption row">
            <!-- <div class="text-h2">First stop</div>
            <div class="text-subtitle1">Mountains</div> -->
            <div class="text-h6 ellipsis">
              <q-btn icon="volume_up" flat round :loading="i.loading" @click="i.loading = true; $chupipay.say(`${i.name}'. '${i.description}`, { onEnd () { i.loading = false; } } )" />
              {{ i.name }}
            </div>
            <!-- <div class="text-subtitle2">by John Doe</div> -->
          </div>
        </q-carousel-slide>
      </q-carousel>
      <!-- <q-img src="https://cdn.quasar.dev/img/parallax2.jpg">
        <div class="absolute-bottom">
          <div class="text-h6">Our Changing Planet</div>
          <div class="text-subtitle2">by John Doe</div>
        </div>
      </q-img> -->

      <q-card-section>
        <q-btn
          fab
          color="deep-orange-9"
          icon="add_shopping_cart"
          class="absolute"
          style="top: 0; right: 12px; transform: translateY(-50%);"
          @click="addToCart(i)"
        />

        <div class="row no-wrap items-center">
          <div class="col text-h6">
            <q-rating :modelValue="+i.rating" :max="5" size="26px" />
          </div>
          <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
            <!-- <q-icon name="place" /> -->
            {{(+i.price).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- <div class="text-subtitle1">
          $・Italian, Cafe
        </div> -->
        <div class="text-caption text-grey-8 ellipsis">
          <!-- <q-btn icon="volume_up" flat round :loading="$global.loading" @click="$global.loading = true; $chupipay.say(i.description, { onEnd () { $global.loading = false; } } )" /> -->
          {{ i.description }}
        </div>
      </q-card-section>

      <!-- <q-separator />

      <q-card-actions>
        <q-btn flat round icon="event" />
        <q-btn flat color="primary">
          Reserve
        </q-btn>
      </q-card-actions> -->
    </q-card>
  </div>
</template>
<script setup>
// import cart from 'components/cart'
import { getCurrentInstance, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { LocalStorage, useQuasar } from 'quasar'
const $q = useQuasar()
const app = getCurrentInstance()

const { $api, $global, $qs, $chupipay } = app.appContext.config.globalProperties
// const qs = require('qs')
const route = useRoute()

// $global.jwt = LocalStorage.getItem('jwtt')
// $global.user = LocalStorage.getItem('userr')
// $global.cart = LocalStorage.getItem('cartt') || []
// console.log('$global.user', $global.user)

window.setUser = ({ user, jwt }) => {
  console.log('called', { user, jwt })
  $api.defaults.headers.common.Authorization = 'Bearer ' + jwt
  $global.user = user
  $global.jwt = jwt
  LocalStorage.set('jwtt', jwt)
  LocalStorage.set('userr', user)
}

onMounted(async () => {
  console.log('mounted')
  const query = {
    populate: ['images']
  }
  let items = null
  try {
    const { data: { data: itemss } } = await $api.get('/items?' + $qs.stringify(query))
    items = itemss
  } catch (error) {
    delete $api.defaults.headers.common.Authorization
    const { data: { data: itemsss } } = await $api.get('/items?' + $qs.stringify(query))
    items = itemsss
  }
  console.log(items)
  $global.items = items.map(i => ({
    ...i.attributes,
    id: i.id,
    imgModel: `${i.id}-${i.attributes.images.data[0].id}`,
    images: i.attributes.images.data.map(img => ({
      id: img.id, ...img.attributes
    }))
  }))
  console.log('items', $global.items)

  if (route.query.id_token) {
    console.log(route.query.id_token)
    delete $api.defaults.headers.common.Authorization
    const { data } = await $api.get('/auth/google/callback?' + $qs.stringify(route.query))
    if (window.opener) {
      console.log('window.opener', data)
      window.opener.setUser(data)
      setTimeout(() => {
        window.close()
      }, 5000)
    } else {
      window.setUser(data)
    }
  }
})

function addToCart (i) {
  const ind = $global.cart.findIndex(c => c.id === i.id)
  let msg = ''
  if (ind < 0) {
    $global.cart.push({
      ...i,
      quantity: 1
    })
    $q.notify({
      message: msg = `${i.name} was added`,
      color: 'purple'
    })
    // $chupipay.say(`${i.name} was added`)
  } else if ($global.cart[ind].quantity < $global.cart[ind].orderLimit) {
    $global.cart[ind].quantity++
    $q.notify({
      message: msg = `${i.name} was added`,
      color: 'purple'
    })
    // $chupipay.say(`${i.name} was added`)
  } else {
    $q.notify({
      message: msg = `${i.name} quantity limit reached`,
      color: 'negative'
    })
    // $chupipay.say(`${i.name} quantity limit reached`)
  }
  LocalStorage.set('cartt', $global.cart)

  return msg
}

const commands = [
  {
    indexes: ['add *', 'i want *', 'more *'], // These spoken words will trigger the execution of the command
    smart: true,
    action: function (whatsthis, wildcard) { // Action to be executed when a index match with spoken word
      console.log('wildcard', wildcard)
      const item = $global.items.filter(i => i.name.toLowerCase() === wildcard.replaceAll('.', ''))[0]
      if (item) $chupipay.say(addToCart(item))
    }
  }
]
$chupipay.addCommands(commands)

</script>
