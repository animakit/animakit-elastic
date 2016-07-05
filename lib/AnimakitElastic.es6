import React           from 'react';
import { findDOMNode } from 'react-dom';
import { isEqual }     from 'animakit-core';

export default class AnimakitElastic extends React.Component {
  static propTypes = {
    children: React.PropTypes.any,
    duration: React.PropTypes.number,
    easing:   React.PropTypes.string
  };

  static defaultProps = {
    duration: 500,
    easing:   'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  };

  state = {
    contentWidth:  null,
    contentHeight: null,
    parentWidth:   null,
    parentHeight:  null,
    animation:     false
  };

  contentNode      = null;
  parentNode       = null;
  animationResetTO = null;
  resizeCheckerRAF = null;
  winLoaded        = false;
  contentMounted   = false;

  listeners = {
    checkResize: this.checkResize.bind(this),
    winOnLoad:   this.winOnLoad.bind(this)
  };

  componentDidMount() {
    this.initNodes();
    this.initLoad();

    this.repaint();
  }

  componentWillReceiveProps() {
    this.repaint();
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

  initNodes() {
    this.contentNode = findDOMNode(this.refs.content);
    this.parentNode = document.body;
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
        animation: false
      });
    }, this.props.duration + 1);
  }

  cancelAnimationReset() {
    if (this.animationResetTO) clearTimeout(this.animationResetTO);
  }

  calcContentDimensions() {
    const contentWidth  = this.contentNode.offsetWidth;
    const contentHeight = this.contentNode.offsetHeight;

    return [contentWidth, contentHeight];
  }

  calcParentDimensions() {
    const rect = this.contentNode.getBoundingClientRect();

    const parentWidth  = this.parentNode.offsetWidth - rect.left;
    const parentHeight = this.parentNode.offsetHeight - rect.top;

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

    this.repaint();

    this.startResizeChecker();
  }

  repaint() {
    const [contentWidth, contentHeight] = this.calcContentDimensions();
    const [parentWidth, parentHeight] = this.calcParentDimensions();

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

  getWrapperStyles() {
    const { contentWidth, contentHeight } = this.state;

    const position = 'relative';

    const width = contentWidth !== null ? `${ contentWidth }px` : 'auto';
    const height = contentHeight !== null ? `${ contentHeight }px` : 'auto';

    if (!this.state.animation) {
      return { position, width, height };
    }

    const overflow = 'hidden';
    const { duration, easing } = this.props;
    const transition = `width ${ duration }ms ${ easing }, height ${ duration }ms ${ easing }`;

    return { position, overflow, width, height, transition };
  }

  getContainerStyles() {
    const position = 'absolute';

    const { parentWidth, parentHeight } = this.state;

    const width = parentWidth !== null ? `${ parentWidth }px` : 'auto';
    const height = parentHeight !== null ? `${ parentHeight }px` : 'auto';

    return { position, width, height };
  }

  getContentStyles() {
    const position = 'absolute';

    return { position };
  }

  render() {
    return (
      <div>
        <div style = { this.getWrapperStyles() }>
          <div style = { this.getContainerStyles() }>
            <div
              style = { this.getContentStyles() }
              ref = "content"
            >
              <span style = {{ display: 'table', height: 0 }}></span>
              { this.props.children }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
