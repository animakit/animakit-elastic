import React              from 'react';
import test               from 'ava';
import { shallow, mount } from 'enzyme';
import AnimakitElastic    from '../lib/AnimakitElastic.js';

test('shallow', t => {
  const wrapper = shallow(<AnimakitElastic />);
  t.is(wrapper.type(), 'div');
});

test('mount', t => {
  const wrapper = mount(<AnimakitElastic />);
  t.is(wrapper.children().length, 1);
});

test('has container', t => {
  const wrapper = shallow(<AnimakitElastic />);
  t.is(wrapper.children().length, 1);
});

test('has children', t => {
  const wrapper = shallow(
    <AnimakitElastic><div>1</div></AnimakitElastic>
  );
  const container = wrapper.childAt(0);
  t.is(container.children().length, 1);
});
