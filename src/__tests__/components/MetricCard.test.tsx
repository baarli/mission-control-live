import { describe, it, expect } from 'vitest';

import { MetricCard } from '@/components/Dashboard/MetricCard';

import { render, screen } from '../test-utils';

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Test Metric" value={100} change={5} status="success" />);

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays positive change with trending up icon', () => {
    render(<MetricCard title="Test" value={100} change={5} status="success" />);

    expect(screen.getByText('5%')).toBeInTheDocument();
  });

  it('displays negative change with trending down icon', () => {
    render(<MetricCard title="Test" value={100} change={-3} status="warning" />);

    expect(screen.getByText('3%')).toBeInTheDocument();
  });

  it('renders string values correctly', () => {
    render(<MetricCard title="Health" value="98.5%" change={1.2} status="success" />);

    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });
});
