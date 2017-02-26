import React        from 'react';
import AnimakitBase from 'animakit-core';

export default class AnimakitElastic extends AnimakitBase {
  constructor(props) {
    super(props);

    this.state = {
      contentWidth:  null,
      contentHeight: null,
      parentWidth:   null,
      parentHeight:  null,
      animation:     false,
    };
  }

  init() {
    this.parentNode     = document.body;
    this.scrollbarWidth = this.getScrollbarWidth();

    this.contentNode    = null;
    this.contentMounted = false;
  }

  getDuration() {
    return this.props.duration + 1;
  }

  getRootStyles() {
    if (!this.state.animation && !this.props.children) return {};

    const { contentWidth, contentHeight } = this.state;

    const position = 'relative';
    const overflow = 'hidden';

    const width = contentWidth !== null ? `${contentWidth}px` : 'auto';
    const height = contentHeight !== null ? `${contentHeight}px` : 'auto';

    if (!this.state.animation) {
      return { position, overflow, width, height };
    }

    const { duration, easing } = this.props;
    const transition = `width ${duration}ms ${easing}, height ${duration}ms ${easing}`;

    return { position, overflow, width, height, transition };
  }

  getContainerStyles() {
    if (!this.state.animation && !this.props.children) return {};

    const position = 'absolute';

    const { parentWidth, parentHeight } = this.state;

    const width = parentWidth !== null ? `${parentWidth}px` : 'auto';
    const height = parentHeight !== null ? `${parentHeight}px` : 'auto';

    return { position, width, height };
  }

  getContentStyles() {
    if (!this.state.animation && !this.props.children) return {};

    const position = 'absolute';

    return { position };
  }

  getChildrenCount(children) {
    const length = Array.isArray(children) ? children.length : 1;

    if (length > 1) return length;

    return children ? 1 : 0;
  }

  calcDimensions(childrenCount) {
    if (!childrenCount) return [0, 0, 0, 0];

    const rect = this.contentNode.getBoundingClientRect();

    // const contentWidth  = this.contentNode.offsetWidth;
    // const contentHeight = this.contentNode.offsetHeight;

    const contentWidth  = Math.ceil(rect.width);
    const contentHeight = Math.ceil(rect.height);

    const parentWidth  = this.parentNode.offsetWidth - rect.left - this.scrollbarWidth;
    const parentHeight = this.parentNode.offsetHeight - rect.top - this.scrollbarWidth;

    return [contentWidth, contentHeight, parentWidth, parentHeight];
  }

  resetDimensionsState(stateChunk) {
    const { contentWidth, contentHeight, parentWidth, parentHeight } = stateChunk;

    if (
      contentWidth === this.state.contentWidth &&
      contentHeight === this.state.contentHeight &&
      parentWidth === this.state.parentWidth &&
      parentHeight === this.state.parentHeight
    ) return {};

    return stateChunk;
  }

  repaint(props) {
    const childrenCount = this.getChildrenCount(props.children);

    const [contentWidth, contentHeight, parentWidth, parentHeight] = this.calcDimensions(childrenCount);

    const state = this.resetDimensionsState({ contentWidth, contentHeight, parentWidth, parentHeight });

    if (!Object.keys(state).length) return;

    state.animation = this.contentMounted;

    if (this.state.parentWidth === null) {
      setTimeout(() => {
        this.contentMounted = true;
      }, 1);
    }

    this.applyState(state);
  }

  render() {
    return (
      <div style = { this.getRootStyles() }>
        <div style = { this.getContainerStyles() }>
          <div
            style = { this.getContentStyles() }
            ref = {(c) => { this.contentNode = c; }}
          >
          { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

AnimakitElastic.propTypes = {
  children: React.PropTypes.any,
  duration: React.PropTypes.number,
  easing:   React.PropTypes.string,
};

AnimakitElastic.defaultProps = {
  duration: 500,
  easing:   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
