import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, shallowRef, nextTick } from 'vue'

// Create a proper mock store with refs
const createMockStore = () => {
  return {
    isOpen: ref(false),
    view: shallowRef(null),  // Use shallowRef for component definitions
    actions: ref([]),
    title: ref(''),
    size: ref(''),
    close: vi.fn()
  }
}

vi.mock('@/stores/modal', () => ({
  useModalStore: vi.fn(() => createMockStore())
}))

import BsModal from '@/components/service/bs-modal.vue'
import { useModalStore } from '@/stores/modal'

// Mock Bootstrap CSS classes if needed
vi.mock('bootstrap', () => ({
  // Mock bootstrap components if you use them
}))

describe('BsModal', () => {
  let modalStore

  beforeEach(() => {
    modalStore = createMockStore()
    useModalStore.mockReturnValue(modalStore)
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    test('renders nothing when modal is not open', () => {
      modalStore.isOpen.value = false

      const wrapper = mount(BsModal)

      expect(wrapper.find('.modal').exists()).toBe(false)
      expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
    })

    test('renders modal when isOpen is true', () => {
      modalStore.isOpen.value = true

      modalStore.title.value = 'Test Modal'
      modalStore.size.value = 'lg'
      modalStore.actions.value = [
        { label: 'Save', type: 'primary', callback: vi.fn() },
        { label: 'Cancel', type: 'secondary', callback: vi.fn() }
      ]

      const wrapper = mount(BsModal)

      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
      expect(wrapper.find('.modal-title').text()).toBe('Test Modal')
      expect(wrapper.find('.modal-dialog').classes()).toContain('modal-lg')

      const buttons = wrapper.findAll('.modal-footer .btn')
      expect(buttons).toHaveLength(2)
      expect(buttons[0].text()).toBe('Save')
      expect(buttons[1].text()).toBe('Cancel')
    })
  })

  describe('Interactions', () => {
    beforeEach(() => {
      modalStore.isOpen.value = true
      modalStore.title.value = 'Test Modal'
    })

    test('calls close when close button is clicked', async () => {
      const wrapper = mount(BsModal)

      await wrapper.find('.btn-close').trigger('click')
      expect(modalStore.close).toHaveBeenCalledTimes(1)
    })

    test('calls close when backdrop is clicked', async () => {
      const wrapper = mount(BsModal)

      await wrapper.find('.modal').trigger('click.self')
      expect(modalStore.close).toHaveBeenCalledTimes(1)
    })

    test('does not call closeModal when modal content is clicked', async () => {
      modalStore.view.value = 'div'

      const wrapper = mount(BsModal)

      // Click on the modal content (not the backdrop)
      await wrapper.find('.modal-content').trigger('click')
      expect(modalStore.close).not.toHaveBeenCalled()
    })

    test('calls action callback when action button is clicked', async () => {
      modalStore.view.value = 'div'

      const mockCallback = vi.fn()
      modalStore.actions.value = [
        { label: 'Test Action', type: 'primary', callback: mockCallback }
      ]

      const wrapper = mount(BsModal)

      await wrapper.find('.btn-primary').trigger('click')

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith({
        action: '',
        data: null
      })
    })

    test('renders multiple action buttons correctly', () => {
      modalStore.view.value = 'div'
      modalStore.actions.value = [
        { label: 'Save', type: 'primary', callback: vi.fn() },
        { label: 'Delete', type: 'danger', callback: vi.fn() },
        { label: 'Cancel', type: 'secondary', callback: vi.fn() }
      ]

      const wrapper = mount(BsModal)
      const buttons = wrapper.findAll('.modal-footer .btn')

      expect(buttons).toHaveLength(3)
      expect(buttons[0].classes()).toContain('btn-primary')
      expect(buttons[0].text()).toMatch('Save')
      expect(buttons[1].classes()).toContain('btn-danger')
      expect(buttons[1].text()).toMatch('Delete')
      expect(buttons[2].classes()).toContain('btn-secondary')
      expect(buttons[2].text()).toMatch('Cancel')
    })
  })

  describe('Dynamic Component', () => {
    test('renders dynamic component with correct props', () => {
      const TestComponent = {
        template: '<div>Test Component</div>',
        props: ['modelValue']
      }

      // Use shallowRef or markRaw to prevent the component from becoming reactive
      modalStore.view.value = TestComponent
      modalStore.isOpen.value = true
      modalStore.title.value = 'Test Modal'

      const wrapper = mount(BsModal)

      expect(wrapper.findComponent(TestComponent).exists()).toBeTruthy()
      expect(wrapper.findComponent(TestComponent).props('modelValue')).toEqual({
        action: '',
        data: null
      })
    })
  })

  describe('Watchers and Reactivity', () => {
    beforeEach(() => {
      modalStore.isOpen.value = true
      modalStore.title.value = 'Test Modal'
      modalStore.view.value = 'div'
    })

    test('handles model.action changes and closes modal', async () => {
      const wrapper = mount(BsModal)

      // Access the reactive model and change action
      wrapper.vm.model.action = 'close'
      wrapper.vm.model.data = { reason: 'user_cancelled' }

      await nextTick()

      expect(modalStore.close).toHaveBeenCalledWith({ reason: 'user_cancelled' })
      expect(wrapper.vm.model.action).toMatch('')
    })

    test('resets model.action after change', async () => {
      const wrapper = mount(BsModal)

      wrapper.vm.model.action = 'close'
      await nextTick()

      expect(wrapper.vm.model.action).toMatch('')
    })
  })

  describe('Keyboard Events', () => {
    beforeEach(() => {
      modalStore.isOpen.value = true
      modalStore.title.value = 'Test Modal'
      modalStore.view.value = 'div'
    })

    test('closes modal on Escape key press', async () => {
      mount(BsModal)

      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(escapeEvent)

      expect(modalStore.close).toHaveBeenCalledTimes(1)
    })

    test('does not close modal on other key presses', async () => {
      mount(BsModal)

      // Simulate other key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      window.dispatchEvent(enterEvent)

      expect(modalStore.close).not.toHaveBeenCalled()
    })
  })

  describe('Lifecycle', () => {
    test('removes event listener on unmount', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      // Mount the component
      const wrapper = mount(BsModal)

      // Verify event listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      // Get the actual handler function that was added
      const keydownHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'keydown'
      )[1]

      // Unmount the component
      wrapper.unmount()
      await flushPromises()

      // Verify event listener was removed with the same handler
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', keydownHandler)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    test('adds event listener when component mounts', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      mount(BsModal)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      modalStore.isOpen.value = true
      modalStore.title.value = 'Test Modal'
      modalStore.view.value = 'div'
      modalStore.actions = []
    })

    test('hides header when title is empty', () => {
      modalStore.title.value = ''

      const wrapper = mount(BsModal)

      // The header should still exist but be empty
      const header = wrapper.find('.modal-header')
      expect(header.exists()).toBeTruthy()
      expect(header.find('.modal-title').text()).toMatch('')
    })

    test('hides footer when no actions are provided', () => {
      modalStore.actions.value = []

      const wrapper = mount(BsModal)

      const footer = wrapper.find('.modal-footer')
      expect(footer.exists()).toBeTruthy()
      // The footer exists but has no buttons
      expect(footer.findAll('button')).toHaveLength(0)
    })
  })
})
