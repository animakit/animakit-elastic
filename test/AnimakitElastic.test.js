/* eslint-env jest */

import { shallow }     from 'enzyme';

import React           from 'react';
import AnimakitElastic from '../lib/AnimakitElastic.js';

describe('<AnimakitElastic />', () => {
  it('should render', () => {
    const component = shallow(<AnimakitElastic />);

    expect(component).toMatchSnapshot();
  });
});
