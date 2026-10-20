export function useViewLayout() {
  const viewLayout = useState<Layout>(STATE_NAMES.layout, () => 'gridLayout');
  const restored = useState('view-layout-restored', () => false);

  if (import.meta.client && !restored.value) {
    const storedLayout = getLocalStorage(STATE_NAMES.layout);
    if (storedLayout === 'gridLayout' || storedLayout === 'listLayout') {
      viewLayout.value = storedLayout;
    }
    restored.value = true;
  }

  function setViewLayout(selectedLayout: Layout = 'gridLayout') {
    viewLayout.value = selectedLayout;
    setLocalStorage(STATE_NAMES.layout, viewLayout.value);
  }

  return {
    setViewLayout,
    viewLayout,
  };
}
