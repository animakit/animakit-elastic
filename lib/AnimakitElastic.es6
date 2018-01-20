import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isEqual, transitionEventName, getScrollbarWidth } from './utils';

export default class AnimakitElastic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animation: false,

      contentWidth: null,
      contentHeight: null,

      parentWidth: null,
      parentHeight: null,
    };

    this.setRootNode = this.setRootNode.bind(this);
    this.setContentNode = this.setContentNode.bind(this);
  }

  componentWillMount() {
    this.parentNode = document.body;
    this.rootNode = null;
    this.contentNode = null;
    this.contentMounted = false;

    this.transitionEventName = transitionEventName();
    this.scrollbarWidth = getScrollbarWidth();

    this.listeners = this.getListeners();

    this.animationReset = false;
    this.animationResetTO = null;
    this.resizeCheckerRAF = null;
  }

  componentDidMount() {
    this.repaint(this.props);

    this.toggleAnimationListener(true);
  }

  componentWillReceiveProps(nextProps) {
    this.repaint(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateChanged = !isEqual(nextState, this.state);

    const childrenChanged = !isEqual(nextProps.children, this.props.children);

    return stateChanged || childrenChanged;
  }

  componentWillUpdate() {
    this.toggleResizeChecker(false);
  }

  componentDidUpdate() {
    this.toggleResizeChecker(true);
  }

  componentWillUnmount() {
    this.toggleResizeChecker(false);
    this.toggleAnimationReset(false);
    this.toggleAnimationListener(false);
  }

  getListeners() {
    return {
      onCheckResize: this.onCheckResize.bind(this),
      onTransitionEnd: this.onTransitionEnd.bind(this),
    };
  }

  toggleResizeChecker(start) {
    if (typeof requestAnimationFrame === 'undefined') return;

    if (start) {
      this.resizeCheckerRAF = requestAnimationFrame(this.listeners.onCheckResize);
    } else if (this.resizeCheckerRAF) {
      cancelAnimationFrame(this.resizeCheckerRAF);
    }
  }

  toggleAnimationReset(add) {
    if (this.animationResetTO) clearTimeout(this.animationResetTO);

    if (add) {
      this.animationResetTO = setTimeout(() => {
        this.animationReset = true;
      }, this.props.duration);
    } else {
      this.animationReset = false;
    }
  }

  toggleAnimationListener(add) {
    const method = add ? 'addEventListener' : 'removeEventListener';
    this.rootNode[method](this.transitionEventName, this.listeners.onTransitionEnd, false);
  }

  onTransitionEnd() {
    if (!this.animationReset) return;

    this.setState({
      animation: false,
    });
  }

  onCheckResize() {
    this.toggleResizeChecker(false);

    this.repaint(this.props);

    this.toggleResizeChecker(true);
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

    const contentWidth = Math.ceil(rect.width);
    const contentHeight = Math.ceil(rect.height);

    const parentWidth = this.parentNode.offsetWidth - rect.left - this.scrollbarWidth;
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

    const [
      contentWidth, contentHeight, parentWidth, parentHeight,
    ] = this.calcDimensions(childrenCount);

    const state = this.resetDimensionsState({
      contentWidth, contentHeight, parentWidth, parentHeight,
    });

    if (!Object.keys(state).length) return;

    state.animation = this.contentMounted;

    if (this.state.parentWidth === null) {
      setTimeout(() => {
        this.contentMounted = true;
      }, 1);
    }

    this.applyState(state);
  }

  applyState(state) {
    if (!Object.keys(state).length) return;

    if (state.animation) {
      this.toggleAnimationReset(false);
    }

    this.setState(state);

    if (state.animation) {
      this.toggleAnimationReset(true);
    }
  }

  setRootNode(c) {
    this.rootNode = c;
  }

  setContentNode(c) {
    this.contentNode = c;
  }

  render() {
    return (
      <div
        ref={this.setRootNode}
        style={ this.getRootStyles() }
      >
        <div style={ this.getContainerStyles() }>
          <div
            style={ this.getContentStyles() }
            ref={this.setContentNode}
          >
          { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

AnimakitElastic.propTypes = {
  children: PropTypes.any,
  duration: PropTypes.number,
  easing: PropTypes.string,
};

AnimakitElastic.defaultProps = {
  duration: 500,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
