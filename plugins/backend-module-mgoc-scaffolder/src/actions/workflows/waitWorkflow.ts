import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { TicketPhase, TicketStatus } from './types';

export function waitWorkflow() {
  type InputParameters = {
    ticketId: string;
    delayMilliseconds: number;
    maxCalls: number;
  };

  return createTemplateAction<InputParameters>({
    id: 'goc:waitWorkflow',
    schema: {
      input: {
        required: ['ticketId'],
        type: 'object',
        properties: {
          ticketId: {
            type: 'string',
            title: 'Ticket Id',
            description:
              'The Ticket Number used to check the status of the Workflow.',
          },
          delayMilliseconds: {
            type: 'number',
            title: 'Delay',
            description:
              'The amount of milliseconds to delay before the next checkStatus call.',
          },
          maxCalls: {
            type: 'number',
            title: 'Max Calls',
            description:
              'The amount of maximum calls allowed to check a status before stopping.',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          status: {
            title: 'Status',
            type: 'object',
            properties: {
              phase: {
                title: 'Status Phase',
                type: 'string',
              },
              message: {
                title: 'Status Message',
                type: 'string',
              },
            },
          },
          results: {
            title: 'Results from Ticket execution',
            type: 'object',
          },
        },
      },
    },
    async handler(ctx) {
      const { ticketId, maxCalls, delayMilliseconds } = getParameters(
        ctx.input,
      );

      function delay() {
        return new Promise(res => setTimeout(res, delayMilliseconds));
      }

      ctx.logger.info(`Checking the status of the ticketId # ${ticketId}...`);

      let status: TicketStatus;
      let i = 1;

      for (;;) {
        // status = await gocService.getTicketStatus(ticketId);
        status = {
          message: 'test',
          phase: TicketPhase.Pending,
        };

        ctx.logger.info(`Current status: ${status.phase} [${i}/${maxCalls}]`);

        if (
          status.phase === TicketPhase.Error ||
          status.phase === TicketPhase.Failed ||
          status.phase === TicketPhase.Succeeded
        ) {
          break;
        }

        if (i++ >= maxCalls) {
          throw new Error('Max calls achieved');
        }

        await delay();
      }

      ctx.output('status.phase', status.phase);
      ctx.output('status.message', status.message);

      if (status.phase === TicketPhase.Succeeded) {
        // retrieving process output
        // const ticketOutputs = await gocService.getTicketOutputs(ticketId);
        const ticketOutputs = {
          outputs: {
            out1: 'test',
            out2: ['test', 'test2'],
          },
        };
        ctx.logger.info(`ticketOutputs: ${ticketOutputs}`);
        ctx.output('results', ticketOutputs.outputs);
      } else {
        throw new Error(
          `The workflow has failed with the message: ${status.message}.`,
        );
      }
    },
  });

  function getParameters(input: InputParameters) {
    const ticketId = input.ticketId;

    let maxCalls = input.maxCalls;
    if (!maxCalls) {
      maxCalls = 30;
    }

    let delayMilliseconds = input.delayMilliseconds;
    if (!delayMilliseconds) {
      delayMilliseconds = 2000;
    }

    return { ticketId, maxCalls, delayMilliseconds };
  }
}
