import { ReactNode } from 'react';
import renderer, { act } from 'react-test-renderer';

import { ThemeName, ThemePreviewProvider, themeOptions } from '@/src/theme';
import { Button, Card, Input } from '@/src/ui/atoms';

const renderWithTheme = async (themeName: ThemeName, node: ReactNode) => {
  let tree: renderer.ReactTestRenderer;

  await act(async () => {
    tree = renderer.create(<ThemePreviewProvider themeName={themeName}>{node}</ThemePreviewProvider>);
  });

  const snapshot = tree!.toJSON();

  await act(async () => {
    tree!.unmount();
  });

  return snapshot;
};

describe('Neon design system snapshots', () => {
  test.each(themeOptions)('Button snapshot [%s]', async ({ name, label }) => {
    expect(await renderWithTheme(name, <Button label={`Play - ${label}`} onPress={() => undefined} />)).toMatchSnapshot();
  });

  test.each(themeOptions)('Card snapshot [%s]', async ({ name }) => {
    expect(
      await renderWithTheme(
        name,
        <Card title="Impostor" subtitle="Round checkpoint UI tokenized." />
      )
    ).toMatchSnapshot();
  });

  test.each(themeOptions)('Input snapshot [%s]', async ({ name }) => {
    expect(
      await renderWithTheme(
        name,
        <Input
          label="Nickname"
          value="Player01"
          onChangeText={() => undefined}
          placeholder="Type your name"
        />
      )
    ).toMatchSnapshot();
  });
});
