import type { TextInputProps } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { useField, useFormContext } from 'remix-validated-form';

interface Props extends TextInputProps {
  name: string;
}

export default function ValidatedTextInput({ name, ...props }: Props) {
  const { error, getInputProps } = useField(name);
  const formContext = useFormContext();

  return (
    <TextInput
      {...getInputProps()}
      {...props}
      error={formContext.hasBeenSubmitted && error}
    />
  );
}
