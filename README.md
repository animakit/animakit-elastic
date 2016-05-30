# AnimakitElastic
React component for flexible resizing of the blocks.

## Usage

```javascript
<AnimakitElastic>
  <div className="text">
    { this.props.text }
  </div>
</AnimakitElastic>
```

## [Demo](http://askd.github.io/animakit/#/elastic)

## Installation

```
npm install animakit-elastic
```

## Properties

| Propery | Required | Type | Default Value  | Available Values  | Description |
| ----- | ----- | ----- | ----- | ----- | ----- |
| duration | false | number | `1000` | Any integer number | Duration of rotation |
| easing | false | string | `ease-out` | Any [easing function](http://easings.net/) | Easing function of rotation |

## Limitations

The components wrapper uses `overflow: hidden` to implement the animation.

## Origin

Part of Animakit.
See http://askd.github.io/animakit for more details.
