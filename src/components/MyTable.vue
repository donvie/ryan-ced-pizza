<template>
  <div>
    <q-table
      title-class="text-h5"
      title="Order Management"
      @row-click="onRowClick"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      binary-state-sort
    >
      <!-- <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->
    </q-table>

    <q-dialog v-model="layout">
      <q-layout view="Lhh lpR fff" container class="bg-white">
        <q-header class="bg-deep-orange-9">
          <q-toolbar>
            <q-toolbar-title><span class="text-weight-thin">Reference No.:</span> {{rowData.refNo}}</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-footer class="bg-deep-orange-9">
          <q-toolbar>
            <q-toolbar-title>
              <!-- <pre>{{statusOptions}}</pre> -->
              <!-- <pre>{{rowData.status.data.attributes.name}}</pre> -->
              <q-select
                color="deep-orange-9"
                bg-color="white"
                filled
                dense
                v-model="rowData.status.data.id"
                :options="statusOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
              >
                <template v-slot:before>
                  <span class="text-h6 text-white">Status: </span>
                </template>

                <template v-slot:hint>
                  Field hint
                </template>

                <template v-slot:after>
                  <q-btn @click="changeStatus()" round dense icon="save" color="deep-orange-9" @click.stop />
                </template>
              </q-select>
            </q-toolbar-title>
          </q-toolbar>
        </q-footer>

        <q-page-container>
          <q-page padding>
            <q-list bordered padding>
              <!-- <pre>{{rowData.status.data.id}}</pre> -->
              <q-item-label header>Items</q-item-label>
              <div v-for="(item, index) in rowData.itemsQuantity" :key="index">
                <q-item>
                  <q-item-section avatar>
                    <q-avatar rounded>
                      <img :src="$api.defaults.baseURL.replace('/api', '') + item.images[0].url">
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                    <q-item-label caption>{{ item.description }}</q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-item-label>{{ rowData.items.data.filter(i => i.id === item.id)[0].attributes.price.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }) }}</q-item-label>
                    <q-item-label caption class="q-gutter-sm row no-wrap items-center">
                      <div class="row no-wrap"><div>Qty: {{item.quantity}}</div></div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script setup>
import { date } from 'quasar'
import { getCurrentInstance, ref, onMounted } from 'vue'

const app = getCurrentInstance()
const { $api, $qs } = app.appContext.config.globalProperties

const columns = [
  { name: 'refNo', label: 'Reference Number', field: 'refNo', align: 'left' },
  { name: 'landmark', label: 'Landmark', field: 'landmark', align: 'left' },
  { name: 'contactNo', label: 'Contact Number', field: 'contactNo', align: 'left' },
  { name: 'address', label: 'Address', field: 'address', align: 'left' },
  { name: 'createdAt', label: 'Created At', field: row => date.formatDate(row.createdAt, 'MMMM DD, YYYY'), align: 'left' }
]

// const status = ref(null)
const statusOptions = ref([])
const layout = ref(false)
const rows = ref([])
const rowData = ref({})
const filter = ref('')
const loading = ref(false)
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 5
})

// emulate ajax call
// SELECT * FROM ... WHERE...LIMIT...
async function fetchFromServer (startRow, count, filter, sortBy, descending) {
  const query = $qs.stringify({
    populate: ['items', 'status'],
    pagination: {
      start: startRow,
      limit: count
    },
    sort: ['updatedAt:desc']
    // filters: {
    //   authors: {
    //     hobby: {
    //       $contains: 'ddd'
    //     }
    //   }
    // }
  }, {
    encodeValuesOnly: true
  })

  const response = await $api.get('/orders?' + query)
  return response.data
}

function onRowClick (evt, row, index) {
  if (row.status.data === null) {
    row.status.data = {
      id: null
    }
  }

  // row.status.data.id = 1
  rowData.value = row
  // rowData.value.status.data.id = null
  layout.value = true
}

async function onRequest (props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  loading.value = true

  // emulate server

  // get all rows if "All" (0) is selected
  const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage

  // calculate starting row of data
  const startRow = (page - 1) * rowsPerPage

  // fetch data from "server"
  const returnedData = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending)
  console.log('returnedData', returnedData)
  // clear out existing data and add new
  rows.value = returnedData.data.map(o => ({ id: o.id, ...o.attributes }))

  // update rowsCount with appropriate value
  pagination.value.rowsNumber = returnedData.meta.pagination.total

  // don't forget to update local pagination object
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  // ...and turn of loading indicator
  loading.value = false
}

async function changeStatus (id) {
  const response = await $api.put('/orders' + '/' + rowData.value.id, {
    data: {
      status: rowData.value.status.data.id
    }
  })

  console.log('response', response)

  layout.value = false
}

async function getStatuses () {
  const { data: { data } } = await $api.get('/statuses')
  statusOptions.value = data.map(o => ({ id: o.id, ...o.attributes })).map(d => {
    return {
      label: d.name,
      value: d.id
    }
  })
}

onMounted(() => {
  getStatuses()
  // get initial data from server (1st page)
  onRequest({
    pagination: pagination.value,
    filter: undefined
  })
})
</script>
