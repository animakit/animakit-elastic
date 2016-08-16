import React                          from 'react';
import { isEqual, getScrollbarWidth } from 'animakit-core';

export default class AnimakitElastic extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    duration: React.PropTypes.number,
    easing:   React.PropTypes.string,
  };

  static defaultProps = {
    duration: 500,
    easing:   'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  };

  state = {
    contentWidth:  null,
    contentHeight: null,
    parentWidth:   null,
    parentHeight:  null,
    animation:     false,
  };

  componentWillMount() {
    this.init();
  }

  componentDidMount() {
    this.parentNode = document.body;

    this.initLoad();

    this.repaint(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.repaint(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const stateChanged = !isEqual(nextState, this.state);

    const propsChanged = !isEqual(nextProps.children, this.props.children);

    return stateChanged || propsChanged;
  }

  componentWillUpdate() {
    this.cancelResizeChecker();
  }

  componentDidUpdate() {
    this.startResizeChecker();
  }

  componentWillUnmount() {
    this.cancelResizeChecker();
    this.cancelAnimationReset();
    this.cancelLoad();
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

  init() {
    this.contentNode      = null;
    this.parentNode       = null;
    this.animationResetTO = null;
    this.resizeCheckerRAF = null;
    this.winLoaded        = false;
    this.contentMounted   = false;
    this.scrollbarWidth = getScrollbarWidth();

    this.listeners = {
      checkResize: this.checkResize.bind(this),
      winOnLoad:   this.winOnLoad.bind(this),
    };
  }

  initLoad() {
    if (!window || document.readyState === 'complete') {
      this.winLoaded = true;
      return;
    }

    window.addEventListener('load', this.listeners.winOnLoad, false);
  }

  cancelLoad() {
    if (!window || this.winLoaded) {
      return;
    }

    window.removeEventListener('load', this.listeners.winOnLoad, false);
  }

  winOnLoad() {
    this.winLoaded = true;
  }

  startResizeChecker() {
    if (typeof requestAnimationFrame === 'undefined') return;
    this.resizeCheckerRAF = requestAnimationFrame(this.listeners.checkResize);
  }

  cancelResizeChecker() {
    if (typeof requestAnimationFrame === 'undefined') return;
    if (this.resizeCheckerRAF) cancelAnimationFrame(this.resizeCheckerRAF);
  }

  startAnimationReset() {
    this.animationResetTO = setTimeout(() => {
      this.setState({
        animation: false,
      });
    }, this.props.duration + 1);
  }

  cancelAnimationReset() {
    if (this.animationResetTO) clearTimeout(this.animationResetTO);
  }

  calcContentDimensions(childrenCount) {
    if (!childrenCount) return [0, 0];

    const contentWidth  = this.contentNode.offsetWidth;
    const contentHeight = this.contentNode.offsetHeight;

    return [contentWidth, contentHeight];
  }

  calcParentDimensions(childrenCount) {
    if (!childrenCount) return [0, 0];

    const rect = this.contentNode.getBoundingClientRect();

    const parentWidth  = this.parentNode.offsetWidth - rect.left - this.scrollbarWidth;
    const parentHeight = this.parentNode.offsetHeight - rect.top - this.scrollbarWidth;

    return [parentWidth, parentHeight];
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

  checkResize() {
    this.cancelResizeChecker();

    this.repaint(this.props);

    this.startResizeChecker();
  }

  repaint(props) {
    const childrenCount = this.getChildrenCount(props.children);

    const [contentWidth, contentHeight] = this.calcContentDimensions(childrenCount);
    const [parentWidth, parentHeight] = this.calcParentDimensions(childrenCount);

    const state = this.resetDimensionsState({ contentWidth, contentHeight, parentWidth, parentHeight });

    if (!Object.keys(state).length) return;

    state.animation = this.winLoaded && this.contentMounted;

    if (this.state.parentWidth === null) {
      setTimeout(() => {
        this.contentMounted = true;
      }, 1);
    }

    if (state.animation) {
      this.cancelAnimationReset();
    }

    this.setState(state);

    if (state.animation) {
      this.startAnimationReset();
    }
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
