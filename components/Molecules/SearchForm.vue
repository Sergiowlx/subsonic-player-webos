<script setup lang="ts">
import ButtonLink from '@/components/Atoms/ButtonLink.vue';
import InputField from '@/components/Atoms/InputField.vue';

const DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 2;

const emit = defineEmits<{
  submit: [value: string];
}>();

const formInputs = {
  query: {
    validationRules: {
      required: true,
    },
  },
};

const form = createForm(formInputs);

let debounceTimer: null | ReturnType<typeof setTimeout> = null;
let lastSubmitted = '';

function clearDebounce() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function onFormSubmit() {
  clearDebounce();
  validateInputs(form);

  if (!form.isValid.value) {
    return;
  }

  submitQuery(form.fields.query.value.value as string, { clearField: true });
}

function submitQuery(
  rawQuery: string,
  { clearField }: { clearField: boolean },
) {
  const query = replaceSpacesWithCharacter(rawQuery).toLowerCase();

  if (!query || query === lastSubmitted) {
    return;
  }

  lastSubmitted = query;

  if (clearField) {
    form.fields.query.value.value = '';
  }

  emit('submit', query);
}

watch(
  () => form.fields.query.value.value,
  (newValue) => {
    clearDebounce();

    const value = (newValue ?? '').toString().trim();

    if (value.length < MIN_QUERY_LENGTH) {
      return;
    }

    debounceTimer = setTimeout(() => {
      submitQuery(value, { clearField: false });
    }, DEBOUNCE_MS);
  },
);

onUnmounted(clearDebounce);
</script>

<template>
  <form novalidate @submit.prevent="onFormSubmit">
    <div class="centerItems">
      <InputField
        :id="HOTKEY_ELEMENT_IDS.searchInput"
        v-model="form.fields.query.value.value"
        :class="$style.inputField"
        hideLabel
        :label="form.fields.query.label"
        placeholder="Search music"
        :required="form.fields.query.required"
      />

      <ButtonLink :class="$style.buttonLink" :icon="ICONS.search" type="submit">
        Search
      </ButtonLink>
    </div>
  </form>
</template>

<style module>
.inputField {
  input {
    padding-right: calc(var(--space-24) * 2);
  }
}

.buttonLink {
  margin-left: calc(var(--space-24) * -2);
}
</style>
