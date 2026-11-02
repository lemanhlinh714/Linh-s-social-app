import * as React from "react";
const SVGComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 237 260"
    width={237}
    height={260}
    {...props}
  >
    <g>
      <g
        fill="none"
        stroke="#F0F066"
        strokeWidth={4.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M95 255 L95 165" />
        <path d="M95 165 Q64 157 50 108" />
        <path d="M95 165 Q61 151 67 101 Q69 75 84 63" />
        <path d="M95 165 Q76 139 82 100 Q86 73 102 59" />
        <path d="M95 165 Q87 135 98 95 Q104 68 119 57" />
        <path d="M95 165 Q99 136 108 101 Q116 76 128 73" />
        <path d="M95 165 Q112 143 125 109 Q133 86 143 82" />
        <path d="M95 165 Q125 153 146 121 Q164 94 165 73" />
        <path d="M95 165 Q133 163 157 135 Q174 113 171 89" />
        <path d="M95 165 Q139 170 164 150 Q174 141 180 131" />
      </g>
      <g fill="#CECE09">
        <circle cx={50} cy={108} r={4.5} />
        <circle cx={84} cy={63} r={4.5} />
        <circle cx={102} cy={59} r={4.5} />
        <circle cx={119} cy={57} r={4.5} />
        <circle cx={128} cy={73} r={4.5} />
        <circle cx={143} cy={82} r={4.5} />
        <circle cx={165} cy={73} r={4.5} />
        <circle cx={171} cy={89} r={4.5} />
        <circle cx={180} cy={131} r={4.5} />
      </g>
    </g>
  </svg>
);
export default SVGComponent;
