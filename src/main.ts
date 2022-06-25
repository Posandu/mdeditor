import './style.css'
import { createPopper } from '@popperjs/core';

/**
 * TODO: Remove this
 */
const editor = document.querySelector('#editor') as HTMLInputElement;

const toolbar = document.querySelector('#toolbar') as HTMLElement;

function create(Container: HTMLInputElement) {
  /**
   * Create an element
   */
  const createElement = (type: string, parent: HTMLElement, className: string = ""): HTMLInputElement => {
    const el = document.createElement(type);
    parent.appendChild(el);
    el.className = className;
    return el as HTMLInputElement;
  }

  /**
   * Declare variables
   */
  const textarea = Container.querySelector('textarea') as HTMLInputElement | unknown as HTMLInputElement;
  const textareaMirror = createElement('div', Container as HTMLInputElement, 'textareaMirror');
  const textareaMirrorInline = createElement('span', textareaMirror);

  textareaMirrorInline.innerHTML = textarea.value.substring(0, textarea.selectionStart as number).replace(/\n$/, "\n");

  /**
   * Track caret position and returns x and y coordinates
   */
  function trackCaret() {
    textareaMirrorInline.innerHTML = textarea.value.substring(0, textarea.selectionStart as number).replace(/\n$/, "\n\u0001");

    const rects = textareaMirrorInline.getClientRects();
    const lastRect = rects[rects.length - 1];
    const top = lastRect.top - textarea.scrollTop;
    const left = lastRect.left + lastRect.width;

    return {
      top,
      left,
      caret: textarea.selectionStart as number
    };
  }

  return {
    trackCaret,
    textarea
  }
}

const creator = create(editor);

let x = 0;
let y = 0;
let caretPos = 0;
let toolbar_open = false;



const popper = createPopper((document.querySelector('.caret') as HTMLElement), toolbar, {
  placement: 'top',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [10, 20],
      },
    },
  ],
})

function updateCaretPosition() {
  const { top, left, caret } = creator.trackCaret();
  x = left;
  y = top;
  caretPos = caret;

  (document.querySelector('.caret') as HTMLElement).style.top = `${y}px`;
  (document.querySelector('.caret') as HTMLElement).style.left = `${x}px`;

  popper.update();
}

const trackEvents = ['keydown', 'keyup', 'keypress', 'focus', 'blur', 'change', 'input', 'cut', 'paste', 'mouseup', 'mousedown', 'mousemove', "scroll"];

trackEvents.forEach(event => {
  creator.textarea.addEventListener(event, updateCaretPosition);
})

function openToolbar() {
  toolbar.classList.add('open');
  toolbar.focus();
  toolbar_open = true;
}

function closeToolbar() {
  toolbar.classList.remove('open');
  toolbar_open = false;
}

creator.textarea.addEventListener("keyup", (e) => {
  /**
   * If the key is slash, we add the class .open to the toolbar
   */
  if (e.key === '/' && !toolbar_open) {
    openToolbar();
    e.preventDefault();
  } else if (e.key === '/' && toolbar_open) {
    closeToolbar();
  }

  /**
   * If key is escape, we remove the class .open from the toolbar
   */
  if (e.key === 'Escape') {
    closeToolbar();
  }
})
