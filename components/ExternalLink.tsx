import { ExternalPathString, Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: ExternalPathString }
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href}
      onPress={(event) => {
        if (Platform.OS !== 'web') {
          event.preventDefault();
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}
