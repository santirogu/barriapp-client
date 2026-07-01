import { fireEvent, render } from '@testing-library/react-native';
import { Stars } from './ui';

describe('Stars', () => {
  it('renders five stars and reports the pressed rating', () => {
    const onChange = jest.fn();
    const { getAllByText } = render(<Stars value={2} onChange={onChange} />);
    const stars = getAllByText('★');
    expect(stars).toHaveLength(5);
    fireEvent.press(stars[3]!);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('is read-only without an onChange handler', () => {
    const { getAllByText } = render(<Stars value={3} />);
    expect(getAllByText('★')).toHaveLength(5);
  });
});
