import styled from 'styled-components';
import { motion } from 'framer-motion';

export const AnimationContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const ExpandableGridContainer = styled.div<{
  $isExpanded: boolean;
  $expandDuration: number;
  $collapseDuration: number;
}>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${props => props.$isExpanded ? '8px' : '0px'};
  transition: gap ${props => props.$isExpanded ? props.$expandDuration : props.$collapseDuration}s ease-in-out;
  overflow: ${props => props.$isExpanded ? 'visible' : 'hidden'};
  padding: ${props => props.$isExpanded ? '24px' : '0px'};
  background: ${props => props.$isExpanded ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  border-radius: ${props => props.$isExpanded ? '16px' : '0px'};
  transition: all ${props => props.$isExpanded ? props.$expandDuration : props.$collapseDuration}s ease-in-out;
`;

export const AdditionalGrid = styled.div`
  width: 100%;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const WeekIndicator = styled(motion.div)`
  position: relative;
  flex-shrink: 0;
  width: 60px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 8px;
  border-radius: 8px;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 2px 6px;
    width: 50px;
  }
`;

export const PlayButton = styled(motion.button)`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px auto;

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 10px 24px;
    font-size: 14px;
  }
`;

export const TestContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const TestHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    color: #333;
    margin-bottom: 12px;

    @media (max-width: 768px) {
      font-size: 24px;
    }
  }

  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 14px;
    }
  }
`;

export const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const StatusMessage = styled(motion.div)`
  padding: 12px 20px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 8px;
  font-size: 14px;
  color: #1976d2;
  margin-bottom: 24px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;
