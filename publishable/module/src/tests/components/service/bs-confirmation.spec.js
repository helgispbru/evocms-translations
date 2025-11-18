// bs-confirmation.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue' // ref, shallowRef,

const createMockComposable = () => {
  return {
    dialogState: {
      visible: true,
      title: 'Test Title',
      message: 'Test Message',
      okButton: 'OK',
      cancelButton: 'Cancel'
    },
    confirm: vi.fn(),
    cancel: vi.fn()
  }
}

// Mock the composable
vi.mock('@/composable/useBsConfirmation', () => ({
  useBsConfirmation: vi.fn(() => createMockComposable())
}))

import { useBsConfirmation } from '@/composable/useBsConfirmation'
import BsConfirmation from '@/components/service/bs-confirmation.vue'

describe('BsConfirmation', () => {
  let wrapper
  let mockConfirm
  let mockCancel

  beforeEach(() => {
    // Reset mocks before each test
    mockConfirm = vi.fn()
    mockCancel = vi.fn()

    // Re-mock with fresh functions
    vi.mocked(useBsConfirmation).mockReturnValue({
      dialogState: {
        visible: true,
        title: 'Test Title',
        message: 'Test Message',
        okButton: 'Confirm',
        cancelButton: 'Cancel'
      },
      confirm: mockConfirm,
      cancel: mockCancel
    })

    wrapper = mount(BsConfirmation)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the modal when visible is true', () => {
      expect(wrapper.find('.bs-confirmation').exists()).toBe(true)
      expect(wrapper.find('.modal').exists()).toBe(true)
      expect(wrapper.find('.modal').classes()).toContain('show')
      expect(wrapper.find('.modal').classes()).toContain('d-block')
    })

    it('does not render the modal when visible is false', async () => {
      vi.mocked(useBsConfirmation).mockReturnValue({
        dialogState: {
          visible: false,
          title: 'Test Title',
          message: 'Test Message',
          okButton: 'OK',
          cancelButton: 'Cancel'
        },
        confirm: mockConfirm,
        cancel: mockCancel
      })

      wrapper = mount(BsConfirmation)
      await nextTick()

      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('displays the correct title, message, and button texts', () => {
      expect(wrapper.find('.modal-title').text()).toBe('Test Title')
      expect(wrapper.find('.modal-body').html()).toContain('Test Message')
      expect(wrapper.find('.btn-primary').text()).toBe('Confirm')
      expect(wrapper.find('.btn-secondary').text()).toBe('Cancel')
    })

    it('renders modal with correct accessibility attributes', () => {
      const modal = wrapper.find('.modal')
      expect(modal.attributes('aria-hidden')).toBe('false')
      expect(modal.attributes('aria-modal')).toBe('true')
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('tabindex')).toBe('-1')
    })
  })

  describe('User Interactions', () => {
    it('calls confirm when OK button is clicked', async () => {
      const okButton = wrapper.find('.btn-primary')
      await okButton.trigger('click')

      expect(mockConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls cancel when Cancel button is clicked', async () => {
      const cancelButton = wrapper.find('.btn-secondary')
      await cancelButton.trigger('click')

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('calls cancel when close button is clicked', async () => {
      const closeButton = wrapper.find('.btn-close')
      await closeButton.trigger('click')

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('calls cancel when modal backdrop is clicked', async () => {
      const modal = wrapper.find('.modal')
      await modal.trigger('click')

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call cancel when modal content is clicked', async () => {
      const modalContent = wrapper.find('.modal-content')
      await modalContent.trigger('click')

      expect(mockCancel).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Events', () => {
    it('calls cancel when Escape key is pressed', async () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(escapeEvent)

      // await wrapper.trigger('keydown', { key: 'Escape' })

      expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    it('does not call cancel when other keys are pressed', async () => {
      await wrapper.trigger('keydown', { key: 'Enter' })
      await wrapper.trigger('keydown', { key: 'Space' })
      await wrapper.trigger('keydown', { key: 'Tab' })

      expect(mockCancel).not.toHaveBeenCalled()
    })
  })

  describe('Event Listeners', () => {
    it('adds event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      mount(BsConfirmation)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const testWrapper = mount(BsConfirmation)

      testWrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('HTML Content', () => {
    it('renders HTML content safely using v-html', () => {
      const htmlMessage = '<strong>Important</strong> message with <em>formatting</em>'

      vi.mocked(useBsConfirmation).mockReturnValue({
        dialogState: {
          visible: true,
          title: 'Test',
          message: htmlMessage,
          okButton: 'OK',
          cancelButton: 'Cancel'
        },
        confirm: mockConfirm,
        cancel: mockCancel
      })

      const testWrapper = mount(BsConfirmation)
      const modalBody = testWrapper.find('.modal-body')

      expect(modalBody.html()).toContain(htmlMessage)
    })
  })
})
