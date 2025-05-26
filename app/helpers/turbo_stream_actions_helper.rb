module TurboStreamActionsHelper
  def show_modal(&block)
    turbo_stream_action_tag(
      :show_modal,
      template: @view_context.capture(&block)
     )
  end
end

Turbo::Streams::TagBuilder.prepend(TurboStreamActionsHelper)
