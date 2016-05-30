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
    parentHeight:  null
  };

  contentNode      = null;
  parentNode       = null;
  resizeCheckerRAF = null;

  componentDidMount() {
    this.contentNode = findDOMNode(this.refs.content);
    this.parentNode = this.getParentNode();

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
  }

  startResizeChecker() {
    if (typeof requestAnimationFrame === 'undefined') return;
    this.resizeCheckerRAF = requestAnimationFrame(this.checkResize.bind(this));
  }

  cancelResizeChecker() {
    if (typeof requestAnimationFrame === 'undefined') return;
    if (this.resizeCheckerRAF) cancelAnimationFrame(this.resizeCheckerRAF);
  }

  getParentNode() {
    const node = findDOMNode(this);

    let parentNode = node.parentNode;
    while (parentNode !== document.body) {
      const display = getComputedStyle(parentNode, null).display;
      if (display === 'block') break;
      parentNode = parentNode.parentNode;
    }

    return parentNode;
  }

  calcContentDimensions() {
    const contentWidth  = this.contentNode.offsetWidth;
    const contentHeight = this.contentNode.offsetHeight;

    return [contentWidth, contentHeight];
  }

  calcParentDimensions() {
    const parentWidth  = this.parentNode.offsetWidth;
    const parentHeight = this.parentNode.offsetHeight;

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

    if (Object.keys(state).length) this.setState(state);
  }

  getWrapperStyles() {
    const position = 'relative';
    const overflow = 'hidden';

    const { contentWidth, contentHeight } = this.state;

    const width = contentWidth !== null ? `${ contentWidth }px` : 'auto';
    const height = contentHeight !== null ? `${ contentHeight }px` : 'auto';

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
