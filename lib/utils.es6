import isEqual from 'lodash.isequal';

/*
 * Check whether the CSS property supported
 */
function isPropertySupported(name, value) {
  const propName = name;

  const element = document.createElement('p');
  document.body.insertBefore(element, null);

  element.style[propName] = value;

  const propValue = window
    .getComputedStyle(element, null)
    .getPropertyValue(propName);

  document.body.removeChild(element);

  return propValue === value;
}

/*
 * Get CSS transitionend event name
 */
function transitionEventName() {
  if (isPropertySupported('transition', 'opacity 1s')) {
    return 'transitionend';
  }

  return 'webkitTransitionEnd';
}

/*
 * Get currenct scrollbar width
 */
function getScrollbarWidth() {
  const outerDiv = document.createElement('div');
  const innerDiv = document.createElement('div');

  outerDiv.style.overflow = 'scroll';

  document.body.insertBefore(outerDiv, null);
  outerDiv.insertBefore(innerDiv, null);

  const scrollbarWidth = outerDiv.offsetWidth - innerDiv.offsetWidth;

  document.body.removeChild(outerDiv);

  return scrollbarWidth;
}

export {
  isEqual,
  transitionEventName,
  getScrollbarWidth,
};
