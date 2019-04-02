// import React from 'react';

export default function render(props = {}) {
  const { data, style, ItemSeparatorComponent, renderItem } = props;

  return (
    <div  style={{ width: '100%', height: '100%' }}>
      {data.map((item, index) => (
        <div key={index} class={this.props.rowClass}>
          {renderItem({ item }, index)}
          {index < (data.length - 1)}
        </div>
      )
      )}
    </div>
  );
}
