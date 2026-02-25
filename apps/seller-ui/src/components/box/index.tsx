'use client';

import styled from 'styled-components';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  css?: React.CSSProperties;
}

const Box = styled.div<BoxProps>`
  box-sizing: border-box;
`;

export default Box;
