import styled from 'styled-components';
import { motion } from 'framer-motion';

export const AnimationContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100px; /* Reserve space for the selector */
`;

export const ExpandableGridContainer = styled(motion.div)<{
  $isExpanded: boolean;
  $expandDuration: number;
  $collapseDuration: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${props => props.$isExpanded ? '8px' : '0px'};
  overflow: ${props => props.$isExpanded ? 'visible' : 'hidden'};
  padding: ${props => props.$isExpanded ? '24px' : '0px'};
  background: ${props => props.$isExpanded ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  border-radius: ${props => props.$isExpanded ? '16px' : '0px'};
  transition: all ${props => props.$isExpanded ? props.$expandDuration : props.$collapseDuration}s ease-in-out;
  z-index: 10; /* Ensure it appears on top of selector */
`;

export const CalendarRow = styled.div<{ $isVisible: boolean }>`
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    gap: 12px;
    padding: 12px;
  }
`;

export const CalendarIconWrapper = styled.div`
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  flex-shrink: 0;
  padding-top: 8px; /* Align with grid padding */
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex: 1;

  @media (max-width: 768px) {
    gap: 6px;
    padding: 6px;
  }
`;

export const DayHeaderButton = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

export const WeekButton = styled(motion.button)<{ $isSelected: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: default;
  background: ${props => props.$isSelected
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.$isSelected ? '#ffffff' : '#333333'};
  box-shadow: ${props => props.$isSelected
    ? '0 4px 12px rgba(102, 126, 234, 0.4)'
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
`;

export const PatternLabel = styled(motion.div)`
  margin-top: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px 16px;
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

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ToggleLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
`;

export const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  width: 48px;
  height: 24px;
  position: relative;
  appearance: none;
  background: #ccc;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:checked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:checked::before {
    transform: translateX(24px);
  }
`;
