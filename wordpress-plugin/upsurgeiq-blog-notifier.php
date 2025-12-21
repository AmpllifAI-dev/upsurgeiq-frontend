<?php
/**
 * Plugin Name: UpsurgeIQ Blog Notifier
 * Description: Automatically sends email notifications to UpsurgeIQ newsletter subscribers when new blog posts are published
 * Version: 1.0.0
 * Author: UpsurgeIQ
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configuration
define('UPSURGEIQ_WEBHOOK_URL', 'https://3000-izy2a9g4czgp8rebq1e44-8eccbcdd.manusvm.computer/api/trpc/blogWebhook');
define('UPSURGEIQ_WEBHOOK_SECRET', 'upsurgeiq-blog-secret-2025');

/**
 * Send notification when a post is published
 */
function upsurgeiq_notify_on_publish($new_status, $old_status, $post) {
    // Only trigger when post transitions to 'publish' status
    if ($new_status !== 'publish' || $old_status === 'publish') {
        return;
    }

    // Only send for blog posts (not pages or custom post types)
    if ($post->post_type !== 'post') {
        return;
    }

    // Prepare post data
    $post_title = get_the_title($post->ID);
    $post_url = get_permalink($post->ID);
    $post_excerpt = wp_strip_all_tags(get_the_excerpt($post->ID));
    
    // If no excerpt, create one from content
    if (empty($post_excerpt)) {
        $post_excerpt = wp_trim_words($post->post_content, 30, '...');
    }

    // Prepare webhook payload
    $payload = array(
        'title' => $post_title,
        'excerpt' => $post_excerpt,
        'url' => $post_url,
        'secret' => UPSURGEIQ_WEBHOOK_SECRET,
    );

    // Send webhook request
    $response = wp_remote_post(UPSURGEIQ_WEBHOOK_URL, array(
        'method' => 'POST',
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($payload),
    ));

    // Log result
    if (is_wp_error($response)) {
        error_log('UpsurgeIQ Blog Notifier Error: ' . $response->get_error_message());
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code === 200) {
            error_log('UpsurgeIQ Blog Notifier: Successfully sent notification for post "' . $post_title . '"');
            error_log('Response: ' . $response_body);
        } else {
            error_log('UpsurgeIQ Blog Notifier Error: HTTP ' . $response_code . ' - ' . $response_body);
        }
    }
}

// Hook into post status transitions
add_action('transition_post_status', 'upsurgeiq_notify_on_publish', 10, 3);

/**
 * Add settings page to WordPress admin
 */
function upsurgeiq_add_admin_menu() {
    add_options_page(
        'UpsurgeIQ Blog Notifier Settings',
        'UpsurgeIQ Notifier',
        'manage_options',
        'upsurgeiq-notifier',
        'upsurgeiq_settings_page'
    );
}
add_action('admin_menu', 'upsurgeiq_add_admin_menu');

/**
 * Settings page content
 */
function upsurgeiq_settings_page() {
    ?>
    <div class="wrap">
        <h1>UpsurgeIQ Blog Notifier Settings</h1>
        <div class="card">
            <h2>Configuration</h2>
            <table class="form-table">
                <tr>
                    <th scope="row">Webhook URL</th>
                    <td>
                        <code><?php echo esc_html(UPSURGEIQ_WEBHOOK_URL); ?></code>
                        <p class="description">This is where blog notifications are sent</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Status</th>
                    <td>
                        <span style="color: green; font-weight: bold;">✓ Active</span>
                        <p class="description">Notifications will be sent automatically when you publish new blog posts</p>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h2>How It Works</h2>
            <ol>
                <li>When you publish a new blog post, this plugin automatically triggers</li>
                <li>It sends the post title, excerpt, and URL to your UpsurgeIQ platform</li>
                <li>UpsurgeIQ then emails all your newsletter subscribers with the new post</li>
                <li>Subscribers receive a beautifully formatted email with a link to read the full post</li>
            </ol>
            <p><strong>Note:</strong> Only new posts trigger notifications. Updating existing published posts will not send notifications.</p>
        </div>
    </div>
    <?php
}

/**
 * Test webhook connection (admin only)
 */
function upsurgeiq_test_webhook() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }

    $test_payload = array(
        'title' => 'Test Blog Post',
        'excerpt' => 'This is a test notification from your WordPress blog.',
        'url' => home_url(),
        'secret' => UPSURGEIQ_WEBHOOK_SECRET,
    );

    $response = wp_remote_post(UPSURGEIQ_WEBHOOK_URL, array(
        'method' => 'POST',
        'timeout' => 30,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($test_payload),
    ));

    if (is_wp_error($response)) {
        echo '<div class="notice notice-error"><p>Error: ' . esc_html($response->get_error_message()) . '</p></div>';
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code === 200) {
            echo '<div class="notice notice-success"><p>Test successful! Check your email.</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>HTTP ' . esc_html($response_code) . ': ' . esc_html($response_body) . '</p></div>';
        }
    }
}

// Add test webhook action
if (isset($_GET['upsurgeiq_test']) && current_user_can('manage_options')) {
    add_action('admin_notices', 'upsurgeiq_test_webhook');
}
