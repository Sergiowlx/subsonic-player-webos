import type { VueWrapper } from '@vue/test-utils';

import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { mount } from '@vue/test-utils';

import GridWrapper from '@/components/Atoms/GridWrapper.vue';
import NoMediaMessage from '@/components/Atoms/NoMediaMessage.vue';
import ArtistItem from '@/components/Organisms/ArtistItem.vue';
import { gridWrapperPropsMock } from '@/test/fixtures';
import { getFormattedArtistsMock } from '@/test/helpers';

import ArtistsList from './ArtistsList.vue';

const isWebOSTVMock = vi.hoisted(() => vi.fn(() => false));

vi.mock('@/utils/webos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/webos')>()),
  isWebOSTV: isWebOSTVMock,
}));

const viewLayoutMock = ref<Layout>('gridLayout');

mockNuxtImport('useViewLayout', () => () => ({
  viewLayout: viewLayoutMock,
}));

function factory(props = {}) {
  return mount(ArtistsList, {
    props: {
      artists: [],
      ...props,
    },
  });
}

describe('ArtistsList', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    isWebOSTVMock.mockReturnValue(false);
    viewLayoutMock.value = 'gridLayout';
    wrapper = factory();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('when the artists prop is an empty array', () => {
    it('does not show the GridWrapper component', () => {
      expect(wrapper.findComponent(GridWrapper).exists()).toBe(false);
    });

    it('shows the NoMediaMessage component', () => {
      expect(wrapper.findComponent(NoMediaMessage).exists()).toBe(true);
    });
  });

  describe('when the artists prop is not an empty array', () => {
    beforeEach(() => {
      wrapper = factory({
        artists: getFormattedArtistsMock(5),
      });
    });

    it('matches the snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('uses the virtual grid for the regular browser grid layout', () => {
      expect(wrapper.find('[data-webos-grid-page]').exists()).toBe(true);
      expect(wrapper.findComponent(GridWrapper).exists()).toBe(false);
    });

    it('uses the virtual grid in the TV layout', () => {
      isWebOSTVMock.mockReturnValue(true);
      wrapper = factory({ artists: getFormattedArtistsMock(5) });

      expect(wrapper.find('[data-webos-grid-page]').exists()).toBe(true);
      expect(wrapper.findComponent(GridWrapper).exists()).toBe(false);
    });

    it('shows the correct number of the ArtistItem component', () => {
      expect(wrapper.findAllComponents(ArtistItem).length).toBe(5);
    });

    it('does not show the NoMediaMessage component', () => {
      expect(wrapper.findComponent(NoMediaMessage).exists()).toBe(false);
    });

    describe('when viewLayout is gridLayout', () => {
      beforeEach(() => {
        viewLayoutMock.value = 'gridLayout';
      });

      it('matches the snapshot', () => {
        expect(wrapper.html()).toMatchSnapshot();
      });

      it('uses the virtual grid', () => {
        expect(wrapper.find('[data-webos-grid-page]').exists()).toBe(true);
        expect(wrapper.findComponent(GridWrapper).exists()).toBe(false);
      });
    });

    describe('when viewLayout is listLayout', () => {
      beforeEach(() => {
        viewLayoutMock.value = 'listLayout';
      });

      const expectedProps = gridWrapperPropsMock.listView;

      it('matches the snapshot', () => {
        expect(wrapper.html()).toMatchSnapshot();
      });

      it('sets the correct desktop prop on the GridWrapper component', () => {
        expect(wrapper.findComponent(GridWrapper).props('desktop')).toBe(
          expectedProps.desktop,
        );
      });

      it('sets the correct mobile prop on the GridWrapper component', () => {
        expect(wrapper.findComponent(GridWrapper).props('mobile')).toBe(
          expectedProps.mobile,
        );
      });

      it('sets the correct spacing prop on the GridWrapper component', () => {
        expect(wrapper.findComponent(GridWrapper).props('spacing')).toBe(
          expectedProps.spacing,
        );
      });

      it('sets the correct tablet prop on the GridWrapper component', () => {
        expect(wrapper.findComponent(GridWrapper).props('tablet')).toBe(
          expectedProps.tablet,
        );
      });
    });
  });
});
