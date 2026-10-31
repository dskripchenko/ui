<script setup lang="ts">
import { computed } from 'vue'
import UidButton from '../Button/UidButton.vue'
import UidDatePicker from '../DatePicker/UidDatePicker.vue'
import UidInput from '../Input/UidInput.vue'
import UidNumberInput from '../NumberInput/UidNumberInput.vue'
import UidSelect from '../Select/UidSelect.vue'
import UidSwitch from '../Switch/UidSwitch.vue'
import UidTagsInput from '../TagsInput/UidTagsInput.vue'
import UidTextarea from '../Textarea/UidTextarea.vue'
import UidTimePicker from '../TimePicker/UidTimePicker.vue'
import { useLocale } from '../../composables/useLocale.js'
import { serializeCalendarEvent, type EventCalendarFreq } from './eventCalendarMarkup'
import { fieldsOf, type EventCalendarDraft } from './eventCalendarDraft'

// The draft is edited in place: the parent owns the reactive object.
const draft = defineModel<EventCalendarDraft>('draft', { required: true })

const emit = defineEmits<{
  save: []
  cancel: []
  remove: []
  skip: []
}>()

const locale = useLocale()
const t = computed(() => locale.value.eventCalendar)

const FREQS: ('none' | EventCalendarFreq)[] = ['none', 'daily', 'weekly', 'monthly', 'yearly']
const ORDINALS = [1, 2, 3, 4, -1] as const

const series = computed(() => draft.value.itemId !== null && draft.value.occurrence !== null)
const single = computed(() => series.value && draft.value.scope === 'one')
const editsSeries = computed(() => !series.value || draft.value.scope === 'all')

const scopeOptions = computed(() => [
  { value: 'one', label: `${t.value.scopeOne} (${draft.value.occurrence})` },
  { value: 'all', label: t.value.scopeAll },
])
const freqOptions = computed(() => FREQS.map((f) => ({ value: f, label: t.value.freq[f] })))
const monthModeOptions = computed(() => (['day', 'nth', 'last'] as const).map((m) => ({ value: m, label: t.value.monthMode[m] })))
const ordinalOptions = computed(() => ORDINALS.map((n) => ({ value: n, label: t.value.ordinals[String(n) as '1'] })))
const weekdayOptions = computed(() => t.value.weekdays.map((name, i) => ({ value: i, label: name })))
const endsOptions = computed(() => (['never', 'until', 'count'] as const).map((m) => ({ value: m, label: t.value.endsMode[m] })))

const dateLabel = computed(() => (single.value ? t.value.date : draft.value.freq === 'none' ? t.value.date : t.value.start))
const line = computed(() => (draft.value.title.trim() ? serializeCalendarEvent(fieldsOf(draft.value, single.value)) : ''))

function setDate(v: string | null): void {
  if (!v) return
  if (single.value) draft.value.occurrence = v
  else draft.value.date = v
}

function toggleDay(i: number): void {
  const d = draft.value
  d.byDay = d.byDay.includes(i) ? d.byDay.filter((x) => x !== i) : [...d.byDay, i]
}

function unskip(date: string): void {
  draft.value.except = draft.value.except.filter((x) => x !== date)
}
</script>

<template>
  <form
    class="uid-event-calendar__form"
    @submit.prevent="emit('save')"
  >
    <label
      v-if="series"
      class="uid-event-calendar__field"
    >
      <span class="uid-event-calendar__label">{{ t.scope }}</span>
      <UidSelect
        :options="scopeOptions"
        :model-value="draft.scope"
        @update:model-value="(v) => (draft.scope = v as 'one' | 'all')"
      />
    </label>
    <label class="uid-event-calendar__field">
      <span class="uid-event-calendar__label">{{ t.title }}</span>
      <UidInput
        v-model="draft.title"
        required
      />
    </label>
    <div class="uid-event-calendar__row">
      <label class="uid-event-calendar__field">
        <span class="uid-event-calendar__label">{{ dateLabel }}</span>
        <UidDatePicker
          :model-value="single ? draft.occurrence : draft.date"
          @update:model-value="setDate"
        />
      </label>
      <label
        v-if="draft.freq === 'none' && editsSeries"
        class="uid-event-calendar__field"
      >
        <span class="uid-event-calendar__label">{{ t.endDate }}</span>
        <UidDatePicker v-model="draft.endDate" />
      </label>
    </div>
    <UidSwitch
      v-model="draft.allDay"
      :label="t.allDay"
    />
    <div
      v-if="!draft.allDay"
      class="uid-event-calendar__row"
    >
      <label class="uid-event-calendar__field">
        <span class="uid-event-calendar__label">{{ t.start }}</span>
        <UidTimePicker
          :model-value="draft.time"
          :step="15"
          @update:model-value="(v) => v && (draft.time = v)"
        />
      </label>
      <label class="uid-event-calendar__field">
        <span class="uid-event-calendar__label">{{ t.end }}</span>
        <UidTimePicker
          :model-value="draft.endTime"
          :step="15"
          @update:model-value="(v) => v && (draft.endTime = v)"
        />
      </label>
    </div>
    <fieldset
      v-if="editsSeries"
      class="uid-event-calendar__repeat"
    >
      <legend class="uid-event-calendar__label">
        {{ t.repeat }}
      </legend>
      <div class="uid-event-calendar__row">
        <UidSelect
          :options="freqOptions"
          :model-value="draft.freq"
          @update:model-value="(v) => (draft.freq = v as 'none' | EventCalendarFreq)"
        />
        <div
          v-if="draft.freq !== 'none'"
          class="uid-event-calendar__interval"
        >
          <span>{{ t.every }}</span>
          <UidNumberInput
            :model-value="draft.interval"
            :min="1"
            :max="99"
            @update:model-value="(v) => (draft.interval = v ?? 1)"
          />
          <span>{{ t.units[draft.freq] }}</span>
        </div>
      </div>
      <div
        v-if="draft.freq === 'weekly'"
        class="uid-event-calendar__days"
        role="group"
        :aria-label="t.onDays"
      >
        <button
          v-for="(name, i) in t.weekdays"
          :key="i"
          type="button"
          class="uid-event-calendar__day"
          :class="{ 'uid-event-calendar__day--on': draft.byDay.includes(i) }"
          :aria-pressed="draft.byDay.includes(i)"
          @click="toggleDay(i)"
        >
          {{ name }}
        </button>
      </div>
      <div
        v-if="draft.freq === 'monthly'"
        class="uid-event-calendar__row"
      >
        <UidSelect
          :options="monthModeOptions"
          :model-value="draft.monthMode"
          @update:model-value="(v) => (draft.monthMode = v as 'day' | 'nth' | 'last')"
        />
        <UidNumberInput
          v-if="draft.monthMode === 'day'"
          :model-value="draft.monthDay"
          :min="1"
          :max="31"
          @update:model-value="(v) => (draft.monthDay = v ?? 1)"
        />
        <UidSelect
          v-if="draft.monthMode === 'nth'"
          :options="ordinalOptions"
          :model-value="draft.nth"
          @update:model-value="(v) => (draft.nth = Number(v))"
        />
        <UidSelect
          v-if="draft.monthMode === 'nth'"
          :options="weekdayOptions"
          :model-value="draft.nthDay"
          @update:model-value="(v) => (draft.nthDay = Number(v))"
        />
      </div>
      <div
        v-if="draft.freq !== 'none'"
        class="uid-event-calendar__row"
      >
        <label class="uid-event-calendar__field">
          <span class="uid-event-calendar__label">{{ t.ends }}</span>
          <UidSelect
            :options="endsOptions"
            :model-value="draft.ends"
            @update:model-value="(v) => (draft.ends = v as 'never' | 'until' | 'count')"
          />
        </label>
        <label
          v-if="draft.ends === 'until'"
          class="uid-event-calendar__field"
        >
          <span class="uid-event-calendar__label">{{ t.endDate }}</span>
          <UidDatePicker v-model="draft.until" />
        </label>
        <label
          v-if="draft.ends === 'count'"
          class="uid-event-calendar__field"
        >
          <span class="uid-event-calendar__label">{{ t.times }}</span>
          <UidNumberInput
            :model-value="draft.count"
            :min="1"
            :max="999"
            @update:model-value="(v) => (draft.count = v ?? 1)"
          />
        </label>
      </div>
      <div
        v-if="draft.freq !== 'none' && draft.except.length"
        class="uid-event-calendar__skipped"
      >
        <span class="uid-event-calendar__label">{{ t.skipped }}</span>
        <button
          v-for="date in draft.except"
          :key="date"
          type="button"
          class="uid-event-calendar__chip"
          :title="t.delete"
          @click="unskip(date)"
        >
          {{ date }} ×
        </button>
      </div>
    </fieldset>
    <label class="uid-event-calendar__field">
      <span class="uid-event-calendar__label">{{ t.tags }}</span>
      <UidTagsInput v-model="draft.tags" />
    </label>
    <label class="uid-event-calendar__field">
      <span class="uid-event-calendar__label">{{ t.where }}</span>
      <UidInput v-model="draft.where" />
    </label>
    <label class="uid-event-calendar__field">
      <span class="uid-event-calendar__label">{{ t.extra }}</span>
      <UidTextarea
        v-model="draft.extra"
        :rows="2"
        auto-grow
        placeholder="key: value"
      />
    </label>
    <div
      v-if="line"
      class="uid-event-calendar__line"
    >
      <span class="uid-event-calendar__label">{{ t.line }}</span>
      <code>{{ line }}</code>
    </div>
    <div class="uid-event-calendar__buttons">
      <UidButton
        type="submit"
        variant="primary"
      >
        {{ t.save }}
      </UidButton>
      <UidButton
        variant="ghost"
        @click="emit('cancel')"
      >
        {{ t.cancel }}
      </UidButton>
      <UidButton
        v-if="series"
        variant="secondary"
        @click="emit('skip')"
      >
        {{ t.skip }}
      </UidButton>
      <UidButton
        v-if="draft.itemId !== null"
        variant="danger"
        class="uid-event-calendar__delete"
        @click="emit('remove')"
      >
        {{ t.delete }}
      </UidButton>
    </div>
  </form>
</template>
