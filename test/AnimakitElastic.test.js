/* eslint-env jest */

import { render }     from 'enzyme';

import React           from 'react';
import AnimakitElastic from '../lib/AnimakitElastic.js';

describe('<AnimakitElastic />', () => {
  it('should render', () => {
    const component = render(<AnimakitElastic />);

    expect(component).toMatchSnapshot();
  });
});
