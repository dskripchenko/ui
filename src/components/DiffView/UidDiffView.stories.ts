import type { Meta, StoryObj } from '@storybook/vue3'
import UidDiffView from './UidDiffView.vue'
import type { DiffFile } from './diff'

const meta: Meta<typeof UidDiffView> = {
  title: 'Components/DiffView',
  component: UidDiffView,
  tags: ['autodocs'],
  argTypes: { mode: { control: 'inline-radio', options: ['unified', 'split'] } },
}

export default meta
type Story = StoryObj<typeof UidDiffView>

const files: DiffFile[] = [
  {
    path: 'app/Webhooks/RetryPolicy.php',
    patch: [
      '@@ -39,9 +39,12 @@ final class RetryPolicy',
      '     public function for(string $event): Policy',
      '     {',
      '-        return $this->policies[$event];',
      '+        return $this->policies[$event]',
      '+            ?? $this->fallbackFor($event)',
      '+            ?? Policy::none();',
      '     }',
      ' ',
      '     private function load(): void',
      '     {',
      '         // ...',
    ].join('\n'),
  },
  { path: 'config/webhooks.php', patch: '@@ -10,3 +10,4 @@\n     \'retries\' => 5,\n+    \'cancelled\' => \'exponential\',\n     \'timeout\' => 10,' },
  { path: 'tests/RetryPolicyTest.php', status: 'added', patch: '@@ -0,0 +1,3 @@\n+<?php\n+\n+it(\'retries a cancel\', fn () => true);' },
]

export const Default: Story = {
  args: { files, title: 'Retries for payment.* events' },
}

export const SideBySide: Story = {
  args: { files, title: 'Retries for payment.* events', mode: 'split', open: 3 },
}
